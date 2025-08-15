// src/common/events/ai.events.ts
export class AIContentGeneratedEvent {
  constructor(
    public readonly subchapterId: string,
    public readonly userId: string,
    public readonly contentLength: number,
    public readonly model: string,
    public readonly tokensUsed: number,
    public readonly generationTime: number, // in milliseconds
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AIChatMessageEvent {
  constructor(
    public readonly userId: string,
    public readonly subchapterId: string,
    public readonly question: string,
    public readonly response: string,
    public readonly model: string,
    public readonly tokensUsed: number,
    public readonly responseTime: number, // in milliseconds
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AIQuizGeneratedEvent {
  constructor(
    public readonly subchapterId: string,
    public readonly userId: string,
    public readonly difficulty: string,
    public readonly questionCount: number,
    public readonly model: string,
    public readonly tokensUsed: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AIAudioGeneratedEvent {
  constructor(
    public readonly contentId: string,
    public readonly audioUrl: string,
    public readonly textLength: number,
    public readonly audioLength: number, // in seconds
    public readonly service: string, // e.g., 'elevenlabs'
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AIErrorEvent {
  constructor(
    public readonly service: string, // 'openai', 'elevenlabs', etc.
    public readonly operation: string,
    public readonly error: string,
    public readonly userId?: string,
    public readonly subchapterId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AIUsageThresholdEvent {
  constructor(
    public readonly userId: string,
    public readonly usageType: 'tokens' | 'requests' | 'audio_minutes',
    public readonly currentUsage: number,
    public readonly threshold: number,
    public readonly period: string, // 'daily', 'monthly', etc.
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AICacheHitEvent {
  constructor(
    public readonly cacheType: 'content' | 'chat' | 'quiz',
    public readonly cacheKey: string,
    public readonly userId?: string,
    public readonly subchapterId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AICacheMissEvent {
  constructor(
    public readonly cacheType: 'content' | 'chat' | 'quiz',
    public readonly cacheKey: string,
    public readonly userId?: string,
    public readonly subchapterId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
