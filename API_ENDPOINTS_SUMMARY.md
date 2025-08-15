# API Endpoints Summary

## Content Management Endpoints

### Grades

- `POST /content/grades` - Create a new grade (Admin only)
- `GET /content/grades` - Get all grades
- `GET /content/grades/:id` - Get grade by ID
- `PUT /content/grades/:id` - Update grade (Admin only)
- `DELETE /content/grades/:id` - Delete grade (soft delete, Admin only)

### Subjects

- `POST /content/subjects` - Create a new subject (Admin only)
- `GET /content/grades/:gradeId/subjects` - Get subjects by grade
- `GET /content/subjects/:id` - Get subject by ID
- `PUT /content/subjects/:id` - Update subject (Admin only)
- `DELETE /content/subjects/:id` - Delete subject (soft delete, Admin only)

### Chapters

- `POST /content/chapters` - Create a new chapter (Admin only)
- `GET /content/subjects/:subjectId/chapters` - Get chapters by subject
- `GET /content/chapters/:id` - Get chapter by ID
- `PUT /content/chapters/:id` - Update chapter (Admin only)
- `DELETE /content/chapters/:id` - Delete chapter (soft delete, Admin only)

### Subchapters

- `POST /content/subchapters` - Create a new subchapter (Admin only)
- `GET /content/chapters/:chapterId/subchapters` - Get subchapters by chapter
- `GET /content/subchapters/:id` - Get subchapter by ID
- `PUT /content/subchapters/:id` - Update subchapter (Admin only)
- `DELETE /content/subchapters/:id` - Delete subchapter (soft delete, Admin only)

## Quiz Management Endpoints

### Quiz CRUD

- `POST /quiz` - Create a new quiz (Admin only)
- `GET /quiz` - Get all quizzes (Admin/Guru only)
- `GET /quiz/:id` - Get quiz by ID
- `PUT /quiz/:id` - Update quiz (Admin only)
- `DELETE /quiz/:id` - Delete quiz (soft delete, Admin only)

### Quiz Questions CRUD

- `POST /quiz/questions` - Create a new quiz question (Admin only)
- `GET /quiz/:quizId/questions` - Get questions by quiz ID
- `GET /quiz/questions/:id` - Get quiz question by ID
- `PUT /quiz/questions/:id` - Update quiz question (Admin only)
- `DELETE /quiz/questions/:id` - Delete quiz question (Admin only)

### Student Quiz Operations

- `GET /quiz/subchapters/:subchapterId` - Get quiz by subchapter (for students)
- `POST /quiz/:quizId/submit` - Submit quiz answers
- `GET /quiz/attempts` - Get user quiz attempts

## AI Services Endpoints

- `GET /ai/subchapters/:subchapterId/content` - Get or generate AI content for subchapter
- `POST /ai/subchapters/:subchapterId/ask` - Ask a question about the subchapter content
- `GET /ai/subchapters/:subchapterId/chat-history` - Get chat history for subchapter

## Progress Tracking Endpoints

- `GET /progress` - Get user progress
- `GET /progress/summary` - Get progress summary
- `GET /progress/subjects/:subjectId` - Get subject progress

## Unreal Engine Integration Endpoints

- `GET /unreal/sessions/:subchapterId` - Get Metahuman session data for subchapter
- `POST /unreal/sessions/:sessionId/duration` - Update session duration
- `GET /unreal/sessions` - Get session history

## Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/change-password` - Change password

## New DTOs Created

### Content Management DTOs

- `UpdateGradeDto` - For updating grades
- `UpdateSubjectDto` - For updating subjects
- `UpdateChapterDto` - For updating chapters
- `UpdateSubchapterDto` - For updating subchapters

### Quiz Management DTOs

- `CreateQuizDto` - For creating quizzes with optional questions
- `UpdateQuizDto` - For updating quizzes
- `CreateQuizQuestionDto` - For creating individual quiz questions
- `UpdateQuizQuestionDto` - For updating quiz questions

## Features Added

### CRUD Operations

- Full CRUD operations for all content entities (grades, subjects, chapters, subchapters)
- Full CRUD operations for quiz management
- Proper validation and error handling
- Soft delete implementation for content entities

### Swagger Documentation

- Complete API documentation with Swagger/OpenAPI
- Detailed endpoint descriptions and examples
- Request/response schemas
- Authentication requirements
- Role-based access control documentation

### Security & Authorization

- Role-based access control (Admin, Guru, Student)
- JWT authentication for all endpoints
- Proper authorization guards
- Rate limiting for AI endpoints

### Data Validation

- Comprehensive input validation using class-validator
- Type safety with TypeScript
- Proper error responses

### Caching & Performance

- Cache invalidation for content updates
- Transaction support for data consistency
- Optimized database queries

## Access Control

### Admin Only

- All CREATE, UPDATE, DELETE operations for content management
- Quiz and question management
- User management

### Guru (Teacher)

- View all quizzes
- View content (read-only)

### Student

- View content
- Take quizzes
- View progress
- Use AI services
- Access Unreal Engine integration

All endpoints require JWT authentication except for registration and login.
