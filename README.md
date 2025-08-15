# 🎓 LMS Backend - Learning Management System

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

> **⚠️ Development Status**: This application is currently in development phase. See [Production Readiness](#-production-readiness) section for deployment guidelines.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Production Readiness](#-production-readiness)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

LMS Backend is a comprehensive Learning Management System built with modern technologies. It provides a robust API for online learning platforms with AI integration, real-time communication, and advanced content management capabilities.

### Key Capabilities

- **User Management**: Multi-role authentication (Students, Teachers, Admins)
- **Content Management**: Hierarchical content structure (Grades → Subjects → Chapters → Subchapters)
- **AI Integration**: OpenAI ChatGPT for content generation and student interaction
- **Voice Synthesis**: ElevenLabs integration for audio content
- **Quiz System**: Automated quiz generation and assessment
- **Progress Tracking**: Comprehensive learning progress monitoring
- **Real-time Communication**: WebSocket support for live interactions
- **Unreal Engine Integration**: Metahuman support for immersive learning

## ✨ Features

### 🔐 Authentication & Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Account lockout protection
- Rate limiting and throttling
- Input validation and sanitization
- Security headers (Helmet.js)
- CORS configuration

### 📚 Content Management

- Hierarchical content structure
- AI-powered content generation
- Multi-media support
- Version control for content
- Content caching and optimization

### 🤖 AI Integration

- OpenAI GPT-4 integration
- Intelligent content generation
- Student chat assistance
- Voice synthesis with ElevenLabs
- AI-powered quiz generation

### 📊 Analytics & Monitoring

- User progress tracking
- Learning analytics
- Performance monitoring
- Health check endpoints
- Structured logging

### 🚀 Performance & Scalability

- Redis caching
- Database query optimization
- Connection pooling
- Compression middleware
- CDN-ready architecture

## 🛠 Tech Stack

### Backend Framework

- **NestJS 11.x** - Progressive Node.js framework
- **TypeScript 5.x** - Type-safe JavaScript
- **Node.js 20.x** - JavaScript runtime

### Database & ORM

- **PostgreSQL 16.x** - Primary database
- **Drizzle ORM 0.44.x** - Type-safe ORM
- **Redis 7.x** - Caching and sessions

### External Services

- **OpenAI API** - AI content generation
- **ElevenLabs API** - Voice synthesis
- **Socket.IO** - Real-time communication

### DevOps & Infrastructure

- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx         │    │   Backend       │
│   (React/Vue)   │◄──►│   Reverse Proxy │◄──►│   NestJS API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   Redis         │◄────────────┤
                       │   Cache/Session │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │   PostgreSQL    │◄────────────┤
                       │   Primary DB    │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │   External APIs │◄────────────┘
                       │   OpenAI/11Labs │
                       └─────────────────┘
```

### Module Structure

```
src/
├── auth/           # Authentication & authorization
├── content/        # Content management
├── ai/             # AI integration services
├── quiz/           # Quiz system
├── progress/       # Progress tracking
├── unreal/         # Unreal Engine integration
├── health/         # Health checks
├── common/         # Shared utilities
├── database/       # Database configuration
└── config/         # Application configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 16.x
- Redis 7.x
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lms-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**

   ```bash
   # Generate database schema
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed initial data (optional)
   npm run db:seed
   ```

5. **Start development server**

   ```bash
   npm run start:dev
   ```

### Using Docker

1. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

2. **View logs**

   ```bash
   docker-compose logs -f app
   ```

## 💻 Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start development server with hot reload
npm run start:debug    # Start with debug mode

# Building
npm run build          # Build for production
npm run start:prod     # Start production server

# Database
npm run db:generate    # Generate database migrations
npm run db:push        # Apply migrations to database
npm run db:studio      # Open Drizzle Studio
npm run db:seed        # Seed database with initial data

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Environment Variables

Key environment variables you need to configure:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lms_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-min-32-chars"

# External APIs
OPENAI_API_KEY="your-openai-api-key"
ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV="development"
```

See `.env.example` for complete configuration options.

## 📖 API Documentation

### Endpoints Overview

- **Authentication**: `/api/auth/*`
- **Content Management**: `/api/content/*`
- **AI Services**: `/api/ai/*`
- **Quiz System**: `/api/quiz/*`
- **Progress Tracking**: `/api/progress/*`
- **Health Checks**: `/api/health`

### Swagger Documentation

When running in development mode, API documentation is available at:

```
http://localhost:3000/docs
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example API Calls

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe",
    "role": "SISWA"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Get content
curl -X GET http://localhost:3000/api/content/grades \
  -H "Authorization: Bearer <your-token>"
```

## 🧪 Testing

### Current Test Coverage

```
Statements   : 13.23% (Target: 80%)
Branches     : 11.15% (Target: 80%)
Functions    : 13.4%  (Target: 80%)
Lines        : 12.96% (Target: 80%)
```

> ⚠️ **Warning**: Test coverage is currently below production standards. See [target-prod.md](./target-prod.md) for improvement roadmap.

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Specific test file
npm run test -- auth.service.spec.ts
```

### Test Structure

```
test/
├── auth.e2e-spec.ts       # Authentication E2E tests
├── app.e2e-spec.ts        # Application E2E tests
├── setup.ts               # Test setup configuration
└── jest-e2e.json          # E2E Jest configuration

src/
├── **/*.spec.ts           # Unit tests
└── **/*.integration.spec.ts # Integration tests
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment

```bash
# Build production image
docker build -t lms-backend:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=<your-db-url> \
  lms-backend:latest
```

### Docker Compose (Recommended)

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d

# With custom environment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

For production deployment, ensure you have:

1. **Strong secrets** (minimum 32 characters)
2. **SSL/TLS certificates** configured
3. **Database connection pooling** enabled
4. **Redis clustering** for high availability
5. **Monitoring and logging** configured

## ⚠️ Production Readiness

**Current Status**: 🟡 **Development Phase**

**Production Readiness Score**: **6.5/10**

### Critical Issues to Address

1. **Test Coverage**: Currently 13.23% (Target: 80%+)
2. **Security**: Hardcoded secrets in development
3. **Monitoring**: Limited production monitoring
4. **Documentation**: API documentation incomplete

### Before Production Deployment

Please review [target-prod.md](./target-prod.md) for:

- ✅ Production readiness checklist
- 🔧 Critical fixes required
- 📋 Deployment roadmap
- 🎯 Performance targets

**Recommendation**: Do not deploy to production until critical issues are resolved.

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   ```
6. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
7. **Push to your fork**
8. **Create a Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Test Coverage**: Minimum 80% for new code

### Pull Request Guidelines

- Include tests for new features
- Update documentation as needed
- Ensure all CI checks pass
- Add detailed description of changes
- Reference related issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and [target-prod.md](./target-prod.md)
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Redis Connection**: Verify Redis server is accessible
3. **Environment Variables**: Check all required variables are set
4. **Port Conflicts**: Ensure ports 3000, 5432, 6379 are available

### Health Checks

Monitor application health at:

- **API Health**: `GET /api/health`
- **Database**: `GET /api/health/database`
- **Redis**: `GET /api/health/redis`
- **External APIs**: `GET /api/health/external`

---

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Development
- **Last Updated**: December 2024
- **Node.js**: 20.x
- **NestJS**: 11.x

---

**Made with ❤️ for modern learning experiences**
