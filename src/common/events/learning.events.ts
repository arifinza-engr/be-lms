// src/common/events/learning.events.ts
export class LearningProgressUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly subchapterId: string,
    public readonly status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
    public readonly completedAt?: Date,
  ) {}
}

export class QuizCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly quizId: string,
    public readonly score: number,
    public readonly totalQuestions: number,
    public readonly completedAt: Date,
  ) {}
}

export class AIContentGeneratedEvent {
  constructor(
    public readonly subchapterId: string,
    public readonly contentId: string,
    public readonly contentType: 'INITIAL' | 'RESPONSE',
    public readonly generatedAt: Date,
  ) {}
}

export class UserQuestionAskedEvent {
  constructor(
    public readonly userId: string,
    public readonly subchapterId: string,
    public readonly question: string,
    public readonly askedAt: Date,
  ) {}
}
