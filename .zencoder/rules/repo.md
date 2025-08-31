---
description: Repository Information Overview
alwaysApply: true
---

# LMS Backend Information

## Summary

A comprehensive Learning Management System backend built with NestJS, providing robust API for online learning platforms with AI integration, real-time communication, and advanced content management capabilities.

## Structure

- **src/**: Main application source code organized by modules
  - **auth/**: Authentication & authorization
  - **content/**: Content management
  - **ai/**: AI integration services
  - **quiz/**: Quiz system
  - **progress/**: Progress tracking
  - **unreal/**: Unreal Engine integration
  - **database/**: Database configuration and schema
- **test/**: End-to-end tests
- **drizzle/**: Database migrations
- **uploads/**: Storage for uploaded files

## Language & Runtime

**Language**: TypeScript
**Version**: TypeScript 5.x
**Runtime**: Node.js 20.x
**Build System**: NestJS CLI
**Package Manager**: npm 10.x+

## Dependencies

**Main Dependencies**:

- NestJS 11.x (Core, Common, Config, JWT, Passport)
- Drizzle ORM 0.44.x
- PostgreSQL (via pg 8.x)
- Redis 5.x
- OpenAI 5.x
- Socket.IO 4.x
- Multer 2.x (File uploads)
- Swagger/OpenAPI (API documentation)

**Development Dependencies**:

- Jest 30.x (Testing)
- ESLint 9.x & Prettier 3.x
- ts-jest & ts-node
- Drizzle Kit 0.31.x

## Build & Installation

```bash
# Install dependencies
npm install

# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (optional)
npm run db:seed

# Development server
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Docker

**Dockerfile**: Multi-stage build with Node.js 20 Alpine
**Image Configuration**:

- Production-optimized with security hardening
- Non-root user (nestjs:nodejs)
- Health check configured
- Exposed port: 3000

**Docker Compose**:

- Services: app, postgres, redis, nginx
- Postgres 15 Alpine for database
- Redis 7 Alpine for caching
- Nginx as reverse proxy

## Testing

**Framework**: Jest
**Test Location**:

- Unit tests: src/\*_/_.spec.ts
- Integration tests: src/\*_/_.integration.spec.ts
- E2E tests: test/\*.e2e-spec.ts

**Configuration**: jest.config.js with 80% coverage threshold
**Run Command**:

```bash
# Unit tests
npm run test

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```
