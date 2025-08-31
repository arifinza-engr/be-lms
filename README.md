# 🎓 LMS Backend - Learning Management System

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

> **🚀 Production Ready**: Comprehensive Learning Management System with AI integration, real-time communication, and Unreal Engine support.

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
- [Contributing](#-contributing)

## 🎯 Overview

LMS Backend is a comprehensive Learning Management System built with modern technologies. It provides a robust API for online learning platforms with AI integration, real-time communication, and advanced content management capabilities.

### Key Capabilities

- **🔐 Multi-Role Authentication**: Students, Teachers, and Administrators with JWT-based security
- **📚 Hierarchical Content Management**: Grades → Subjects → Chapters → Subchapters structure
- **🤖 AI Integration**: OpenAI GPT-4 for content generation and intelligent tutoring
- **🎵 Voice Synthesis**: ElevenLabs integration for audio content generation
- **📝 Smart Quiz System**: Automated quiz generation and comprehensive assessment
- **📊 Progress Tracking**: Real-time learning analytics and progress monitoring
- **🌐 Real-time Communication**: WebSocket support for live interactions
- **🎮 Unreal Engine Integration**: Metahuman support for immersive learning experiences

## ✨ Features

### 🔐 Security & Authentication

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Account lockout protection with configurable attempts
- Rate limiting and request throttling
- Input validation and sanitization
- Security headers with Helmet.js
- CORS configuration for cross-origin requests

### 📚 Content Management

- Hierarchical content structure with soft delete support
- AI-powered content generation and enhancement
- Multi-media content support
- Version control for educational content
- Content caching and performance optimization
- Bulk operations for content management

### 🤖 AI Integration

- OpenAI GPT-4 integration for intelligent content generation
- Context-aware student chat assistance
- Voice synthesis with ElevenLabs API
- AI-powered quiz generation with explanations
- Personalized learning recommendations

### 📊 Analytics & Monitoring

- Comprehensive user progress tracking
- Learning analytics and performance insights
- Real-time monitoring with health checks
- Structured logging with multiple levels
- Performance metrics and optimization

### 🚀 Performance & Scalability

- Redis caching for improved performance
- Database query optimization with indexes
- Connection pooling for database efficiency
- Compression middleware for reduced bandwidth
- CDN-ready architecture for global deployment

## 🛠 Tech Stack

### Backend Framework

- **NestJS 11.x** - Progressive Node.js framework with TypeScript
- **TypeScript 5.x** - Type-safe JavaScript with advanced features
- **Node.js 20.x** - High-performance JavaScript runtime

### Database & ORM

- **PostgreSQL 16.x** - Advanced relational database
- **Drizzle ORM 0.44.x** - Type-safe ORM with excellent TypeScript support
- **Redis 7.x** - In-memory caching and session storage

### External Services

- **OpenAI API** - GPT-4 for AI content generation and chat
- **ElevenLabs API** - High-quality voice synthesis
- **Socket.IO** - Real-time bidirectional communication

### DevOps & Infrastructure

- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and load balancer
- **Jest** - Comprehensive testing framework
- **ESLint & Prettier** - Code quality and formatting

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

### Interactive Documentation

When running in development mode, comprehensive API documentation is available at:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/health`

### API Overview

The API follows RESTful conventions with the following main endpoints:

- **🔐 Authentication**: `/api/auth/*` - User registration, login, token management
- **📚 Content Management**: `/api/content/*` - CRUD operations for educational content
- **🤖 AI Services**: `/api/ai/*` - AI-powered content generation and chat
- **📝 Quiz System**: `/api/quiz/*` - Quiz creation, management, and submission
- **📊 Progress Tracking**: `/api/progress/*` - Learning progress and analytics
- **🎮 Unreal Integration**: `/api/unreal/*` - Metahuman session management

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example API Usage

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe",
    "role": "SISWA"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123!"
  }'

# Get content hierarchy
curl -X GET http://localhost:3000/api/content/grades \
  -H "Authorization: Bearer <your-token>"
```

For detailed API documentation, see [API-Documentation.md](./API-Documentation.md).

## 🧪 Testing

### Test Coverage

The project maintains comprehensive test coverage across all modules:

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
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

### Production Checklist

Before deploying to production:

- [ ] Set strong JWT secrets (minimum 32 characters)
- [ ] Configure SSL/TLS certificates
- [ ] Set up database connection pooling
- [ ] Configure Redis for caching
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set appropriate CORS origins
- [ ] Enable rate limiting
- [ ] Configure environment variables

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

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit message format
- **Test Coverage**: Maintain high test coverage for new code

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

- **Documentation**: Check this README and [API-Documentation.md](./API-Documentation.md)
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Redis Connection**: Verify Redis server is accessible (optional but recommended)
3. **Environment Variables**: Check all required variables are set correctly
4. **Port Conflicts**: Ensure ports 3000, 5432, 6379 are available
5. **JWT Secrets**: Use strong secrets with minimum 32 characters

### Health Monitoring

Monitor application health at:

- **Health Check**: `http://localhost:3000/api/health`
- **Database Status**: Included in health check response
- **Redis Status**: Included if Redis is configured

---

**Built with ❤️ using NestJS, TypeScript, and modern web technologies.**
