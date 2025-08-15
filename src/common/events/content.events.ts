// src/common/events/content.events.ts
export class GradeCreatedEvent {
  constructor(
    public readonly gradeId: string,
    public readonly title: string,
    public readonly createdBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class SubjectCreatedEvent {
  constructor(
    public readonly subjectId: string,
    public readonly title: string,
    public readonly gradeId: string,
    public readonly createdBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ChapterCreatedEvent {
  constructor(
    public readonly chapterId: string,
    public readonly title: string,
    public readonly subjectId: string,
    public readonly createdBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class SubchapterCreatedEvent {
  constructor(
    public readonly subchapterId: string,
    public readonly title: string,
    public readonly chapterId: string,
    public readonly createdBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ContentUpdatedEvent {
  constructor(
    public readonly contentType: 'grade' | 'subject' | 'chapter' | 'subchapter',
    public readonly contentId: string,
    public readonly updatedFields: string[],
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ContentDeletedEvent {
  constructor(
    public readonly contentType: 'grade' | 'subject' | 'chapter' | 'subchapter',
    public readonly contentId: string,
    public readonly deletedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ContentAccessedEvent {
  constructor(
    public readonly userId: string,
    public readonly contentType: 'grade' | 'subject' | 'chapter' | 'subchapter',
    public readonly contentId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
