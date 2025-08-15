// src/common/events/user.events.ts
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly loginTime: Date,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}

export class UserLoggedOutEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly logoutTime: Date,
  ) {}
}

export class UserAccountLockedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly lockTime: Date,
    public readonly reason: string,
    public readonly lockedUntil: Date,
  ) {}
}

export class UserAccountUnlockedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly unlockTime: Date,
  ) {}
}

export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly changeTime: Date,
  ) {}
}

export class UserProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly updatedFields: string[],
    public readonly updateTime: Date,
  ) {}
}

export class UserProgressUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly subchapterId: string,
    public readonly status: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
