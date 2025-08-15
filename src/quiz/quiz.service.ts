// src/quiz/quiz.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/config/database.config';
import { OpenaiService } from '@/ai/services/openai.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { eq, and, desc } from 'drizzle-orm';
import {
  quizzes,
  quizQuestions,
  quizAttempts,
  userProgress,
  subchapters,
} from '@/database/schema';

@Injectable()
export class QuizService {
  constructor(
    private readonly database: DatabaseService,
    private readonly openaiService: OpenaiService,
  ) {}

  async generateQuizForSubchapter(subchapterId: string) {
    const existingQuiz = await this.database.db.query.quizzes.findFirst({
      where: eq(quizzes.subchapterId, subchapterId),
      with: { questions: true },
    });

    if (existingQuiz) return existingQuiz;

    const subchapter = await this.database.db.query.subchapters.findFirst({
      where: eq(subchapters.id, subchapterId),
      with: {
        chapter: {
          with: {
            subject: {
              with: {
                grade: true,
              },
            },
          },
        },
      },
    });

    if (!subchapter) throw new NotFoundException('Subchapter not found');

    const topic = `${subchapter.title} - ${subchapter.chapter.subject.title} kelas ${subchapter.chapter.subject.grade.title}`;
    const quizData = await this.openaiService.generateQuiz(topic);

    const [quiz] = await this.database.db
      .insert(quizzes)
      .values({
        subchapterId,
        title: `Quiz: ${subchapter.title}`,
        description: `Quiz untuk materi ${subchapter.title}`,
      })
      .returning();

    const questionsData = quizData.questions.map((q: any) => ({
      quizId: quiz.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));

    const questions = await this.database.db
      .insert(quizQuestions)
      .values(questionsData)
      .returning();

    return {
      ...quiz,
      questions,
    };
  }

  async getQuizBySubchapter(subchapterId: string) {
    const quiz = await this.database.db.query.quizzes.findFirst({
      where: eq(quizzes.subchapterId, subchapterId),
      with: {
        questions: {
          columns: {
            id: true,
            question: true,
            options: true,
          },
        },
      },
    });

    return quiz ?? this.generateQuizForSubchapter(subchapterId);
  }

  async submitQuiz(
    userId: string,
    quizId: string,
    submitQuizDto: SubmitQuizDto,
  ) {
    const quiz = await this.database.db.query.quizzes.findFirst({
      where: eq(quizzes.id, quizId),
      with: { questions: true },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');

    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((q) => {
      const userAnswer = submitQuizDto.answers[q.id];
      if (userAnswer === q.correctAnswer) correctAnswers++;
    });

    const maxScore = totalQuestions * 100; // Assuming each question is worth 100 points
    const score = correctAnswers * 100; // Points earned
    const percentage = (correctAnswers / totalQuestions) * 100;

    const [attempt] = await this.database.db
      .insert(quizAttempts)
      .values({
        userId,
        quizId,
        answers: submitQuizDto.answers,
        score,
        maxScore,
        percentage,
        passed: percentage >= 70,
      })
      .returning();

    if (percentage >= 70) {
      const existingProgress =
        await this.database.db.query.userProgress.findFirst({
          where: and(
            eq(userProgress.userId, userId),
            eq(userProgress.subchapterId, quiz.subchapterId),
          ),
        });

      if (existingProgress) {
        await this.database.db
          .update(userProgress)
          .set({
            status: 'COMPLETED',
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userProgress.userId, userId),
              eq(userProgress.subchapterId, quiz.subchapterId),
            ),
          );
      } else {
        await this.database.db.insert(userProgress).values({
          userId,
          subchapterId: quiz.subchapterId,
          status: 'COMPLETED',
          completedAt: new Date(),
        });
      }
    }

    const results = quiz.questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      userAnswer: submitQuizDto.answers[q.id],
      correctAnswer: q.correctAnswer,
      isCorrect: submitQuizDto.answers[q.id] === q.correctAnswer,
      explanation: q.explanation,
    }));

    return {
      attempt,
      score,
      correctAnswers,
      totalQuestions,
      results,
    };
  }

  async getUserQuizAttempts(userId: string, subchapterId?: string) {
    const attempts = await this.database.db.query.quizAttempts.findMany({
      where: eq(quizAttempts.userId, userId),
      with: {
        quiz: {
          with: {
            subchapter: {
              with: {
                chapter: {
                  with: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: (quizAttempts, { desc }) => [desc(quizAttempts.completedAt)],
    });

    if (subchapterId) {
      return attempts.filter(
        (attempt) => attempt.quiz.subchapterId === subchapterId,
      );
    }

    return attempts;
  }

  // CRUD Operations for Quiz Management
  async createQuiz(createQuizDto: CreateQuizDto) {
    const [quiz] = await this.database.db
      .insert(quizzes)
      .values({
        subchapterId: createQuizDto.subchapterId,
        title: createQuizDto.title,
        description: createQuizDto.description,
        isActive: createQuizDto.isActive ?? true,
        timeLimit: createQuizDto.timeLimit,
        passingScore: createQuizDto.passingScore ?? 70,
      })
      .returning();

    // If questions are provided, create them
    if (createQuizDto.questions && createQuizDto.questions.length > 0) {
      const questionsData = createQuizDto.questions.map((q, index) => ({
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order ?? index + 1,
        points: q.points ?? 1,
      }));

      const questions = await this.database.db
        .insert(quizQuestions)
        .values(questionsData)
        .returning();

      return { ...quiz, questions };
    }

    return quiz;
  }

  async getAllQuizzes() {
    return this.database.db.query.quizzes.findMany({
      with: {
        subchapter: {
          with: {
            chapter: {
              with: {
                subject: {
                  with: {
                    grade: true,
                  },
                },
              },
            },
          },
        },
        questions: true,
      },
      orderBy: (quizzes, { desc }) => [desc(quizzes.createdAt)],
    });
  }

  async getQuizById(id: string) {
    const quiz = await this.database.db.query.quizzes.findFirst({
      where: eq(quizzes.id, id),
      with: {
        subchapter: {
          with: {
            chapter: {
              with: {
                subject: {
                  with: {
                    grade: true,
                  },
                },
              },
            },
          },
        },
        questions: true,
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async updateQuiz(id: string, updateQuizDto: UpdateQuizDto) {
    const existingQuiz = await this.getQuizById(id);

    const [updatedQuiz] = await this.database.db
      .update(quizzes)
      .set({
        ...updateQuizDto,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, id))
      .returning();

    return updatedQuiz;
  }

  async deleteQuiz(id: string) {
    const existingQuiz = await this.getQuizById(id);

    // Soft delete by setting isActive to false
    await this.database.db
      .update(quizzes)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, id));

    return { message: 'Quiz deleted successfully' };
  }

  // Quiz Questions CRUD
  async createQuizQuestion(createQuizQuestionDto: CreateQuizQuestionDto) {
    // Verify quiz exists
    await this.getQuizById(createQuizQuestionDto.quizId);

    const [question] = await this.database.db
      .insert(quizQuestions)
      .values({
        quizId: createQuizQuestionDto.quizId,
        question: createQuizQuestionDto.question,
        options: createQuizQuestionDto.options,
        correctAnswer: createQuizQuestionDto.correctAnswer,
        explanation: createQuizQuestionDto.explanation,
        order: createQuizQuestionDto.order ?? 0,
        points: createQuizQuestionDto.points ?? 1,
      })
      .returning();

    return question;
  }

  async getQuizQuestionById(id: string) {
    const question = await this.database.db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.id, id),
      with: {
        quiz: true,
      },
    });

    if (!question) throw new NotFoundException('Quiz question not found');
    return question;
  }

  async updateQuizQuestion(
    id: string,
    updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    const existingQuestion = await this.getQuizQuestionById(id);

    // If quizId is being updated, verify the new quiz exists
    if (updateQuizQuestionDto.quizId) {
      await this.getQuizById(updateQuizQuestionDto.quizId);
    }

    const [updatedQuestion] = await this.database.db
      .update(quizQuestions)
      .set({
        ...updateQuizQuestionDto,
        updatedAt: new Date(),
      })
      .where(eq(quizQuestions.id, id))
      .returning();

    return updatedQuestion;
  }

  async deleteQuizQuestion(id: string) {
    const existingQuestion = await this.getQuizQuestionById(id);

    await this.database.db
      .delete(quizQuestions)
      .where(eq(quizQuestions.id, id));

    return { message: 'Quiz question deleted successfully' };
  }

  async getQuestionsByQuizId(quizId: string) {
    // Verify quiz exists
    await this.getQuizById(quizId);

    return this.database.db.query.quizQuestions.findMany({
      where: eq(quizQuestions.quizId, quizId),
      orderBy: (quizQuestions, { asc }) => [asc(quizQuestions.order)],
    });
  }
}
