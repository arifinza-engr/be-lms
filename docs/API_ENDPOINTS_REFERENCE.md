# API Endpoints Reference untuk Frontend Development

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication Header
```
Authorization: Bearer <jwt_token>
```

## 1. Authentication Endpoints

### POST /auth/register
**Deskripsi**: Registrasi user baru
**Body**:
```json
{
  "email": "siswa@example.com",
  "password": "password123",
  "name": "Nama Siswa",
  "role": "SISWA" // optional, default: SISWA
}
```
**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "siswa@example.com",
    "name": "Nama Siswa",
    "role": "SISWA",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### POST /auth/login
**Deskripsi**: Login user
**Body**:
```json
{
  "email": "siswa@example.com",
  "password": "password123"
}
```
**Response**: Same as register

## 2. Content Management Endpoints

### GET /content/grades
**Deskripsi**: Dapatkan semua grade dengan struktur lengkap
**Response**:
```json
[
  {
    "id": "grade-10",
    "title": "Kelas 10 SMA",
    "subjects": [
      {
        "id": "matematika-10",
        "title": "Matematika",
        "chapters": [
          {
            "id": "aljabar-10",
            "title": "Aljabar",
            "subchapters": [
              {
                "id": "persamaan-linear",
                "title": "Persamaan Linear"
              }
            ]
          }
        ]
      }
    ]
  }
]
```

### GET /content/grades/:id
**Deskripsi**: Dapatkan grade berdasarkan ID
**Response**: Single grade object dengan struktur lengkap

### GET /content/grades/:gradeId/subjects
**Deskripsi**: Dapatkan subjects dalam grade tertentu
**Response**: Array of subjects dengan chapters dan subchapters

### POST /content/grades (Admin only)
**Deskripsi**: Buat grade baru
**Body**:
```json
{
  "title": "Kelas 12 SMA"
}
```

### POST /content/subjects (Admin only)
**Deskripsi**: Buat subject baru
**Body**:
```json
{
  "title": "Biologi",
  "gradeId": "grade-10"
}
```

### GET /content/subjects/:subjectId/chapters
**Deskripsi**: Dapatkan chapters dalam subject tertentu

### POST /content/chapters (Admin only)
**Deskripsi**: Buat chapter baru
**Body**:
```json
{
  "title": "Genetika",
  "subjectId": "biologi-10"
}
```

### GET /content/chapters/:chapterId/subchapters
**Deskripsi**: Dapatkan subchapters dalam chapter tertentu

### POST /content/subchapters (Admin only)
**Deskripsi**: Buat subchapter baru
**Body**:
```json
{
  "title": "Hukum Mendel",
  "chapterId": "genetika-10"
}
```

### GET /content/subchapters/:id
**Deskripsi**: Dapatkan detail subchapter dengan informasi lengkap
**Response**:
```json
{
  "id": "persamaan-linear",
  "title": "Persamaan Linear",
  "chapter": {
    "title": "Aljabar",
    "subject": {
      "title": "Matematika",
      "grade": {
        "title": "Kelas 10 SMA"
      }
    }
  }
}
```

## 3. AI Interaction Endpoints

### GET /ai/subchapters/:subchapterId/content
**Deskripsi**: Dapatkan atau generate konten AI untuk subchapter
**Response**:
```json
{
  "id": "content-id",
  "subchapterId": "persamaan-linear",
  "content": "Persamaan linear adalah...",
  "audioUrl": "https://example.com/audio.mp3",
  "isInitial": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### POST /ai/subchapters/:subchapterId/ask
**Deskripsi**: Tanya jawab dengan AI
**Body**:
```json
{
  "question": "Bagaimana cara menyelesaikan persamaan 2x + 5 = 11?"
}
```
**Response**:
```json
{
  "id": "chat-id",
  "userId": "user-id",
  "subchapterId": "persamaan-linear",
  "message": "Untuk menyelesaikan persamaan 2x + 5 = 11...",
  "messageType": "AI",
  "audioUrl": "https://example.com/audio-response.mp3",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### GET /ai/subchapters/:subchapterId/chat-history
**Deskripsi**: Dapatkan riwayat chat dengan AI
**Response**: Array of chat messages (USER dan AI)

## 4. Quiz System Endpoints

### GET /quiz/subchapters/:subchapterId
**Deskripsi**: Dapatkan atau generate quiz untuk subchapter
**Response**:
```json
{
  "id": "quiz-id",
  "subchapterId": "persamaan-linear",
  "title": "Quiz: Persamaan Linear",
  "description": "Quiz untuk menguji pemahaman",
  "questions": [
    {
      "id": "question-1",
      "question": "Nilai x dari persamaan 3x + 7 = 22 adalah...",
      "options": ["A. 5", "B. 4", "C. 6", "D. 3"]
    }
  ]
}
```

### POST /quiz/:quizId/submit
**Deskripsi**: Submit jawaban quiz
**Body**:
```json
{
  "answers": {
    "question-1": "A",
    "question-2": "B"
  }
}
```
**Response**:
```json
{
  "attempt": {
    "id": "attempt-id",
    "score": 100,
    "completedAt": "2025-01-01T00:00:00.000Z"
  },
  "score": 100,
  "correctAnswers": 2,
  "totalQuestions": 2,
  "results": [
    {
      "questionId": "question-1",
      "question": "Nilai x dari persamaan 3x + 7 = 22 adalah...",
      "userAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true,
      "explanation": "Langkah: 3x + 7 = 22 → 3x = 15 → x = 5"
    }
  ]
}
```

### GET /quiz/attempts
**Deskripsi**: Dapatkan riwayat attempt quiz user
**Query Parameters**:
- `subchapterId` (optional): Filter berdasarkan subchapter

## 5. Progress Tracking Endpoints

### GET /progress
**Deskripsi**: Dapatkan progress pembelajaran user
**Query Parameters**:
- `gradeId` (optional): Filter berdasarkan grade
**Response**:
```json
[
  {
    "id": "progress-id",
    "userId": "user-id",
    "subchapterId": "persamaan-linear",
    "status": "COMPLETED",
    "completedAt": "2025-01-01T00:00:00.000Z",
    "subchapter": {
      "title": "Persamaan Linear",
      "chapter": {
        "title": "Aljabar",
        "subject": {
          "title": "Matematika",
          "grade": {
            "title": "Kelas 10 SMA"
          }
        }
      }
    }
  }
]
```

### GET /progress/summary
**Deskripsi**: Dapatkan ringkasan progress user
**Response**:
```json
{
  "total": 10,
  "notStarted": 5,
  "inProgress": 2,
  "completed": 3,
  "completionPercentage": 30
}
```

### GET /progress/subjects/:subjectId
**Deskripsi**: Dapatkan progress untuk subject tertentu
**Response**:
```json
[
  {
    "id": "persamaan-linear",
    "title": "Persamaan Linear",
    "chapterTitle": "Aljabar",
    "status": "COMPLETED",
    "completedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

## 6. Unreal Engine Integration Endpoints

### GET /unreal/sessions/:subchapterId
**Deskripsi**: Dapatkan data sesi Metahuman
**Response**:
```json
{
  "subchapter": {
    "id": "persamaan-linear",
    "title": "Persamaan Linear",
    "subject": "Matematika",
    "grade": "Kelas 10 SMA"
  },
  "content": {
    "text": "Persamaan linear adalah...",
    "audioUrl": "https://example.com/audio.mp3"
  },
  "character": {
    "name": "AI Teacher",
    "expression": "friendly",
    "animation": "explaining"
  },
  "chatHistory": [
    {
      "type": "ai",
      "message": "Selamat datang di pembelajaran persamaan linear",
      "audioUrl": "https://example.com/welcome.mp3",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ],
  "metadata": {
    "sessionId": "user-123-persamaan-linear-1704067200000",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "duration": 300
  }
}
```

### POST /unreal/sessions/:sessionId/duration
**Deskripsi**: Update durasi sesi
**Body**:
```json
{
  "duration": 450
}
```
**Response**:
```json
{
  "success": true
}
```

### GET /unreal/sessions
**Deskripsi**: Dapatkan riwayat sesi Metahuman
**Query Parameters**:
- `subchapterId` (optional): Filter berdasarkan subchapter

## 7. WebSocket Events

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events untuk Unreal Engine Integration

#### joinSession
**Emit**:
```javascript
socket.emit('joinSession', {
  subchapterId: 'persamaan-linear',
  userId: 'user-id'
});
```
**Listen**:
```javascript
socket.on('sessionData', (data) => {
  // Receive Metahuman session data
});
```

#### updateProgress
**Emit**:
```javascript
socket.emit('updateProgress', {
  sessionId: 'session-id',
  progress: 75
});
```
**Listen**:
```javascript
socket.on('progressUpdate', (data) => {
  // Receive progress updates from other clients
});
```

#### sessionComplete
**Emit**:
```javascript
socket.emit('sessionComplete', {
  sessionId: 'session-id',
  duration: 300
});
```
**Listen**:
```javascript
socket.on('sessionCompleted', (data) => {
  // Session completion confirmation
});
```

## 8. Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

### Validation Error Format
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

## 9. Frontend Implementation Examples

### API Service Setup
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### React Hook Example
```typescript
// hooks/useContent.ts
import { useState, useEffect } from 'react';
import { contentService } from '../services/contentService';

export function useContent() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const data = await contentService.getAllGrades();
        setGrades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return { grades, loading, error };
}
```

### WebSocket Hook Example
```typescript
// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export function useSocket(url: string, token: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url, {
      auth: { token }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url, token]);

  return socketRef.current;
}
```

## 10. Testing Endpoints

### Using curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siswa1@lms.com","password":"siswa123"}'

# Get grades (with auth)
curl -X GET http://localhost:3000/api/content/grades \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Ask AI question
curl -X POST http://localhost:3000/api/ai/subchapters/persamaan-linear/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"question":"Bagaimana cara menyelesaikan persamaan linear?"}'
```

### Using Postman
1. Import collection dari Swagger documentation
2. Set environment variables:
   - `baseUrl`: http://localhost:3000/api
   - `token`: JWT token dari login response
3. Use `{{baseUrl}}` dan `{{token}}` dalam requests

Dokumentasi ini memberikan referensi lengkap untuk semua endpoint yang tersedia di backend LMS, beserta contoh request/response dan implementasi frontend yang sesuai.