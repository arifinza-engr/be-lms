// src/quiz/quiz.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/config/database.config';
import { OpenaiService } from '@/ai/services/openai.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
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

    const score = (correctAnswers / totalQuestions) * 100;

    const [attempt] = await this.database.db
      .insert(quizAttempts)
      .values({
        userId,
        quizId,
        answers: submitQuizDto.answers,
        score,
      })
      .returning();

    if (score >= 70) {
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
}
