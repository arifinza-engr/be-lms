# 📖 LMS Backend API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Content Management](#content-management)
- [AI Services](#ai-services)
- [Quiz System](#quiz-system)
- [Progress Tracking](#progress-tracking)
- [Unreal Engine Integration](#unreal-engine-integration)
- [Health Monitoring](#health-monitoring)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

The LMS Backend API provides a comprehensive RESTful interface for managing educational content, user authentication, AI-powered features, and learning analytics. All endpoints follow REST conventions and return JSON responses.

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.zonaajar.com/api`

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/api/docs` (development only)

### Content Types

- **Request**: `application/json`
- **Response**: `application/json`

## Authentication

### Overview

The API uses JWT (JSON Web Tokens) for authentication with refresh token support. Most endpoints require authentication except for registration and login.

### User Roles

- **SISWA** (Student): Can view content, take quizzes, track progress, use AI services
- **GURU** (Teacher): Can view content and quizzes, access student progress
- **ADMIN**: Full access to all endpoints including content management

### Authentication Header

```http
Authorization: Bearer <jwt-token>
```

### Endpoints

#### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "role": "SISWA"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "SISWA",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "SISWA"
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <jwt-token>
```

#### Change Password

```http
POST /auth/change-password
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

#### Forgot Password

```http
POST /auth/forgot-password
```

**Request Body:**

```json
{
  "email": "student@example.com"
}
```

#### Reset Password

```http
POST /auth/reset-password
```

**Request Body:**

```json
{
  "token": "reset-token",
  "newPassword": "NewPassword123!"
}
```

## Content Management

### Overview

Content is organized hierarchically: Grades → Subjects → Chapters → Subchapters. All content management operations require ADMIN role except for read operations.

### Data Structure

```
Grade (e.g., "Grade 10")
├── Subject (e.g., "Mathematics")
    ├── Chapter (e.g., "Algebra")
        ├── Subchapter (e.g., "Linear Equations")
        └── Subchapter (e.g., "Quadratic Equations")
    └── Chapter (e.g., "Geometry")
```

### Grades

#### Get All Grades

```http
GET /content/grades
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Grade 10",
      "description": "Tenth grade curriculum",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### Get Grade by ID

```http
GET /content/grades/{id}
Authorization: Bearer <jwt-token>
```

#### Create Grade (Admin Only)

```http
POST /content/grades
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "title": "Grade 11",
  "description": "Eleventh grade curriculum"
}
```

#### Update Grade (Admin Only)

```http
PUT /content/grades/{id}
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "title": "Grade 11 Updated",
  "description": "Updated description"
}
```

#### Delete Grade (Admin Only)

```http
DELETE /content/grades/{id}
Authorization: Bearer <jwt-token>
```

### Subjects

#### Get Subjects by Grade

```http
GET /content/grades/{gradeId}/subjects
Authorization: Bearer <jwt-token>
```

#### Get Subject by ID

```http
GET /content/subjects/{id}
Authorization: Bearer <jwt-token>
```

#### Create Subject (Admin Only)

```http
POST /content/subjects
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "title": "Physics",
  "description": "Physics curriculum",
  "gradeId": "grade-uuid"
}
```

#### Update Subject (Admin Only)

```http
PUT /content/subjects/{id}
Authorization: Bearer <jwt-token>
```

#### Delete Subject (Admin Only)

```http
DELETE /content/subjects/{id}
Authorization: Bearer <jwt-token>
```

### Chapters

#### Get Chapters by Subject

```http
GET /content/subjects/{subjectId}/chapters
Authorization: Bearer <jwt-token>
```

#### Get Chapter by ID

```http
GET /content/chapters/{id}
Authorization: Bearer <jwt-token>
```

#### Create Chapter (Admin Only)

```http
POST /content/chapters
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "title": "Mechanics",
  "description": "Introduction to mechanics",
  "order": 1,
  "subjectId": "subject-uuid"
}
```

#### Update Chapter (Admin Only)

```http
PUT /content/chapters/{id}
Authorization: Bearer <jwt-token>
```

#### Delete Chapter (Admin Only)

```http
DELETE /content/chapters/{id}
Authorization: Bearer <jwt-token>
```

### Subchapters

#### Get Subchapters by Chapter

```http
GET /content/chapters/{chapterId}/subchapters
Authorization: Bearer <jwt-token>
```

#### Get Subchapter by ID

```http
GET /content/subchapters/{id}
Authorization: Bearer <jwt-token>
```

#### Create Subchapter (Admin Only)

```http
POST /content/subchapters
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "title": "Newton's Laws",
  "description": "Understanding Newton's three laws of motion",
  "order": 1,
  "chapterId": "chapter-uuid"
}
```

#### Update Subchapter (Admin Only)

```http
PUT /content/subchapters/{id}
Authorization: Bearer <jwt-token>
```

#### Delete Subchapter (Admin Only)

```http
DELETE /content/subchapters/{id}
Authorization: Bearer <jwt-token>
```

## AI Services

### Overview

AI services provide intelligent content generation and interactive chat functionality using OpenAI GPT-4 and ElevenLabs for voice synthesis.

### Rate Limiting

AI endpoints have stricter rate limiting due to external API costs:

- **Content Generation**: 10 requests per hour per user
- **Chat**: 50 messages per hour per user

### Endpoints

#### Get or Generate AI Content

```http
GET /ai/subchapters/{subchapterId}/content
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "uuid",
  "subchapterId": "subchapter-uuid",
  "content": "Detailed explanation of the subchapter topic...",
  "audioUrl": "https://example.com/audio/content.mp3",
  "isInitial": true,
  "version": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Ask Question About Subchapter

```http
POST /ai/subchapters/{subchapterId}/ask
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "question": "Can you explain Newton's first law in simple terms?"
}
```

**Response:**

```json
{
  "id": "uuid",
  "message": "Newton's first law states that an object at rest stays at rest...",
  "audioUrl": "https://example.com/audio/response.mp3",
  "messageType": "AI",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get Chat History

```http
GET /ai/subchapters/{subchapterId}/chat-history
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "message": "Can you explain Newton's first law?",
      "messageType": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "message": "Newton's first law states that...",
      "messageType": "AI",
      "audioUrl": "https://example.com/audio/response.mp3",
      "createdAt": "2024-01-01T00:00:01.000Z"
    }
  ],
  "total": 2,
  "hasMore": false
}
```

## Quiz System

### Overview

The quiz system supports automated quiz generation, question management, and student assessment with detailed analytics.

### Quiz Structure

- **Quiz**: Container for questions, linked to a subchapter
- **Questions**: Multiple choice questions with explanations
- **Attempts**: Student submissions with scoring

### Endpoints

#### Get Quiz by Subchapter (Students)

```http
GET /quiz/subchapters/{subchapterId}
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Newton's Laws Quiz",
  "description": "Test your understanding of Newton's laws",
  "timeLimit": 30,
  "passingScore": 70,
  "questions": [
    {
      "id": "uuid",
      "question": "What is Newton's first law?",
      "options": {
        "A": "F = ma",
        "B": "An object at rest stays at rest",
        "C": "For every action, there is an equal and opposite reaction",
        "D": "None of the above"
      },
      "order": 1,
      "points": 1
    }
  ]
}
```

#### Submit Quiz Answers

```http
POST /quiz/{quizId}/submit
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "answers": {
    "question-uuid-1": "B",
    "question-uuid-2": "A"
  },
  "timeSpent": 1200
}
```

**Response:**

```json
{
  "id": "uuid",
  "score": 8.5,
  "maxScore": 10,
  "percentage": 85,
  "passed": true,
  "timeSpent": 1200,
  "results": [
    {
      "questionId": "uuid",
      "userAnswer": "B",
      "correctAnswer": "B",
      "isCorrect": true,
      "points": 1,
      "explanation": "Correct! Newton's first law is about inertia."
    }
  ],
  "completedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get User Quiz Attempts

```http
GET /quiz/attempts
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `quizId` (optional): Filter by specific quiz
- `limit` (optional): Number of attempts to return
- `offset` (optional): Number of attempts to skip

### Admin/Teacher Quiz Management

#### Get All Quizzes (Admin/Teacher)

```http
GET /quiz
Authorization: Bearer <jwt-token>
```

#### Get Quiz by ID

```http
GET /quiz/{id}
Authorization: Bearer <jwt-token>
```

#### Create Quiz (Admin Only)

```http
POST /quiz
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "title": "Physics Quiz",
  "description": "Test your physics knowledge",
  "subchapterId": "subchapter-uuid",
  "timeLimit": 30,
  "passingScore": 70,
  "questions": [
    {
      "question": "What is the formula for force?",
      "options": {
        "A": "F = ma",
        "B": "F = mv",
        "C": "F = mgh",
        "D": "F = 1/2mv²"
      },
      "correctAnswer": "A",
      "explanation": "Force equals mass times acceleration",
      "points": 1,
      "order": 1
    }
  ]
}
```

#### Update Quiz (Admin Only)

```http
PUT /quiz/{id}
Authorization: Bearer <jwt-token>
```

#### Delete Quiz (Admin Only)

```http
DELETE /quiz/{id}
Authorization: Bearer <jwt-token>
```

### Quiz Questions Management

#### Get Questions by Quiz

```http
GET /quiz/{quizId}/questions
Authorization: Bearer <jwt-token>
```

#### Create Question (Admin Only)

```http
POST /quiz/questions
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "quizId": "quiz-uuid",
  "question": "What is acceleration?",
  "options": {
    "A": "Change in velocity over time",
    "B": "Change in position over time",
    "C": "Force per unit mass",
    "D": "Energy per unit time"
  },
  "correctAnswer": "A",
  "explanation": "Acceleration is the rate of change of velocity",
  "points": 1,
  "order": 2
}
```

#### Update Question (Admin Only)

```http
PUT /quiz/questions/{id}
Authorization: Bearer <jwt-token>
```

#### Delete Question (Admin Only)

```http
DELETE /quiz/questions/{id}
Authorization: Bearer <jwt-token>
```

## Progress Tracking

### Overview

Progress tracking provides comprehensive analytics on user learning progress, including completion status, time spent, and performance metrics.

### Endpoints

#### Get User Progress Overview

```http
GET /progress
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "overall": {
    "totalSubchapters": 100,
    "completedSubchapters": 45,
    "inProgressSubchapters": 15,
    "completionPercentage": 45,
    "averageQuizScore": 82.5
  },
  "recentActivity": [
    {
      "subchapterId": "uuid",
      "subchapterTitle": "Newton's Laws",
      "status": "COMPLETED",
      "completedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Progress Summary

```http
GET /progress/summary
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "grades": [
    {
      "gradeId": "uuid",
      "gradeTitle": "Grade 10",
      "totalSubchapters": 50,
      "completedSubchapters": 25,
      "completionPercentage": 50,
      "subjects": [
        {
          "subjectId": "uuid",
          "subjectTitle": "Physics",
          "totalSubchapters": 20,
          "completedSubchapters": 15,
          "completionPercentage": 75
        }
      ]
    }
  ]
}
```

#### Get Subject Progress

```http
GET /progress/subjects/{subjectId}
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "subject": {
    "id": "uuid",
    "title": "Physics",
    "totalSubchapters": 20,
    "completedSubchapters": 15,
    "completionPercentage": 75
  },
  "chapters": [
    {
      "chapterId": "uuid",
      "chapterTitle": "Mechanics",
      "subchapters": [
        {
          "id": "uuid",
          "title": "Newton's Laws",
          "status": "COMPLETED",
          "completedAt": "2024-01-01T00:00:00.000Z",
          "quizScore": 85,
          "timeSpent": 3600
        }
      ]
    }
  ]
}
```

## Unreal Engine Integration

### Overview

Unreal Engine integration provides Metahuman session management for immersive learning experiences with real-time communication via WebSockets.

### WebSocket Connection

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000/unreal', {
  auth: {
    token: 'your-jwt-token',
  },
});

// Join subchapter session
socket.emit('joinSubchapter', { subchapterId: 'uuid' });

// Listen for session updates
socket.on('sessionUpdate', (data) => {
  console.log('Session updated:', data);
});
```

### REST Endpoints

#### Get Metahuman Session Data

```http
GET /unreal/sessions/{subchapterId}
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "uuid",
  "subchapterId": "subchapter-uuid",
  "sessionData": {
    "metahumanConfig": {
      "character": "teacher_avatar",
      "voice": "professional_female",
      "animations": ["greeting", "explaining", "questioning"]
    },
    "environment": "classroom_3d",
    "interactionMode": "guided_learning"
  },
  "duration": 1800,
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Session Duration

```http
POST /unreal/sessions/{sessionId}/duration
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "duration": 2400
}
```

#### Get Session History

```http
GET /unreal/sessions
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `subchapterId` (optional): Filter by subchapter
- `limit` (optional): Number of sessions to return
- `offset` (optional): Number of sessions to skip

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "subchapterId": "uuid",
      "subchapterTitle": "Newton's Laws",
      "duration": 1800,
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 10,
  "hasMore": true
}
```

## Health Monitoring

### Overview

Health monitoring endpoints provide system status information for monitoring and debugging.

### Endpoints

#### General Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/register"
}
```

### HTTP Status Codes

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Common Error Scenarios

#### Authentication Errors

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Validation Errors

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "error": "Unprocessable Entity",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

#### Rate Limiting

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

## Rate Limiting

### Default Limits

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 login attempts per minute per IP
- **AI Services**: 10 content generations per hour per user
- **AI Chat**: 50 messages per hour per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

---

For more information, see the [README.md](./README.md) or visit the interactive Swagger documentation at `http://localhost:3000/api/docs` when running in development mode.
