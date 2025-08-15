---
description: Repository Information Overview
alwaysApply: true
---

# LMS Backend Information

## Summary

LMS Backend is a Learning Management System built with NestJS and Drizzle ORM. It provides a comprehensive API for online learning platforms with AI integration (OpenAI ChatGPT) and Unreal Engine Metahuman support. The system includes authentication, content management, progress tracking, quiz systems, and real-time communication features.

## Structure

- **src/**: Main application code
  - **ai/**: AI integration services (OpenAI, ElevenLabs)
  - **auth/**: Authentication and authorization
  - **content/**: Content management (grades, subjects, chapters)
  - **database/**: Database configuration and schema
  - **quiz/**: Quiz generation and management
  - **progress/**: User progress tracking
  - **unreal/**: Unreal Engine integration with WebSockets
- **test/**: End-to-end tests
- **drizzle/**: Database migrations

## Language & Runtime

**Language**: TypeScript
**Version**: Node.js >= 20.0.0, npm >= 10.0.0
**Framework**: NestJS 11
**Build System**: NestJS CLI
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- @nestjs/\* (core, common, config, jwt, passport)
- drizzle-orm: PostgreSQL ORM
- openai: AI integration
- socket.io: WebSocket support
- bcryptjs: Password hashing
- class-validator/transformer: Input validation

**Development Dependencies**:

- jest: Testing framework
- typescript: Type checking
- eslint/prettier: Code quality
- drizzle-kit: Database migration tools

## Build & Installation

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database operations
npm run db:generate  # Generate migrations
npm run db:push      # Apply migrations
```

## Docker

**Dockerfile**: Multi-stage build with Node.js 20 Alpine
**Compose**: docker-compose.yml with PostgreSQL, Redis, and Nginx
**Configuration**: Production-ready with health checks and non-root user
**Run Command**:

```bash
docker-compose up -d
```

## Testing

**Framework**: Jest
**Test Location**: Unit tests in src/**/\*.spec.ts, E2E tests in test/
**Naming Convention**: _.spec.ts for unit tests, _.e2e-spec.ts for E2E
**Configuration**: jest.config.js with coverage thresholds
**Run Command\*\*:

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage report
```
