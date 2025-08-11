# LMS Backend API Documentation

## 📋 Overview

LMS Backend API menyediakan endpoint lengkap untuk Learning Management System dengan integrasi AI. API ini dibangun dengan NestJS dan menggunakan Drizzle ORM untuk database operations.

## 🔗 Base Information

- **Base URL**: `http://localhost:3000/api` (Development)
- **Production URL**: `https://your-domain.com/api`
- **API Version**: v1.0.0
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`

## 🔐 Authentication

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Format
```json
{
  "sub": "user_id",
  "email": "user@example.com", 
  "role": "SISWA|ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 📚 API Endpoints

### 1. Authentication Endpoints

#### POST /auth/register
Registrasi user baru ke dalam sistem.

**Request Body:**
```json
{
  "email": "siswa@example.com",
  "password": "password123",
  "name": "Nama Siswa",
  "role": "SISWA"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "siswa@example.com",
    "name": "Nama Siswa",
    "role": "SISWA",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Email already exists

#### POST /auth/login
Login user dan mendapatkan JWT token.

**Request Body:**
```json
{
  "email": "siswa@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "siswa@example.com",
    "name": "Nama Siswa",
    "role": "SISWA",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials

---

### 2. Content Management Endpoints

#### GET /content/grades
Mendapatkan semua grade dengan struktur lengkap.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "grade-10",
    "title": "Kelas 10 SMA",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "subjects": [
      {
        "id": "matematika-10",
        "title": "Matematika",
        "gradeId": "grade-10",
        "chapters": [
          {
            "id": "aljabar-10",
            "title": "Aljabar",
            "subjectId": "matematika-10",
            "subchapters": [
              {
                "id": "persamaan-linear",
                "title": "Persamaan Linear",
                "chapterId": "aljabar-10"
              }
            ]
          }
        ]
      }
    ]
  }
]
```

#### GET /content/grades/:id
Mendapatkan grade berdasarkan ID dengan detail lengkap.

**Parameters:**
- `id` (string) - Grade ID

**Response (200):** Single grade object dengan struktur sama seperti di atas.

**Error Responses:**
- `404` - Grade not found

#### POST /content/grades
Membuat grade baru (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Kelas 12 SMA"
}
```

**Response (201):**
```json
{
  "id": "grade-12",
  "title": "Kelas 12 SMA",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error
- `403` - Access denied (not admin)

#### GET /content/grades/:gradeId/subjects
Mendapatkan subjects dalam grade tertentu.

**Parameters:**
- `gradeId` (string) - Grade ID

**Response (200):**
```json
[
  {
    "id": "matematika-10",
    "title": "Matematika",
    "gradeId": "grade-10",
    "chapters": [
      {
        "id": "aljabar-10",
        "title": "Aljabar",
        "subchapters": [...]
      }
    ]
  }
]
```

#### POST /content/subjects
Membuat subject baru (Admin only).

**Request Body:**
```json
{
  "title": "Biologi",
  "gradeId": "grade-10"
}
```

#### GET /content/subjects/:subjectId/chapters
Mendapatkan chapters dalam subject tertentu.

#### POST /content/chapters
Membuat chapter baru (Admin only).

**Request Body:**
```json
{
  "title": "Genetika",
  "subjectId": "biologi-10"
}
```

#### GET /content/chapters/:chapterId/subchapters
Mendapatkan subchapters dalam chapter tertentu.

#### POST /content/subchapters
Membuat subchapter baru (Admin only).

**Request Body:**
```json
{
  "title": "Hukum Mendel",
  "chapterId": "genetika-10"
}
```

#### GET /content/subchapters/:id
Mendapatkan detail subchapter dengan informasi lengkap.

**Response (200):**
```json
{
  "id": "persamaan-linear",
  "title": "Persamaan Linear",
  "chapterId": "aljabar-10",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "chapter": {
    "id": "aljabar-10",
    "title": "Aljabar",
    "subject": {
      "id": "matematika-10",
      "title": "Matematika",
      "grade": {
        "id": "grade-10",
        "title": "Kelas 10 SMA"
      }
    }
  }
}
```

---

### 3. AI Interaction Endpoints

#### GET /ai/subchapters/:subchapterId/content
Mendapatkan atau generate konten AI untuk subchapter.

**Parameters:**
- `subchapterId` (string) - Subchapter ID

**Response (200):**
```json
{
  "id": "content-persamaan-linear",
  "subchapterId": "persamaan-linear",
  "content": "Persamaan linear adalah persamaan matematika yang memiliki bentuk ax + b = 0...",
  "audioUrl": "https://example.com/audio/persamaan-linear.mp3",
  "isInitial": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### POST /ai/subchapters/:subchapterId/ask
Mengajukan pertanyaan kepada AI tentang materi subchapter.

**Parameters:**
- `subchapterId` (string) - Subchapter ID

**Request Body:**
```json
{
  "question": "Bagaimana cara menyelesaikan persamaan 2x + 5 = 11?"
}
```

**Response (200):**
```json
{
  "id": "chat-123",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "subchapterId": "persamaan-linear",
  "message": "Untuk menyelesaikan persamaan 2x + 5 = 11, ikuti langkah berikut:\n\n1. Kurangi kedua ruas dengan 5...",
  "messageType": "AI",
  "audioUrl": "https://example.com/audio/jawaban-persamaan.mp3",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### GET /ai/subchapters/:subchapterId/chat-history
Mendapatkan riwayat percakapan user dengan AI untuk subchapter tertentu.

**Response (200):**
```json
[
  {
    "id": "chat-1",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "subchapterId": "persamaan-linear",
    "message": "Bagaimana cara menyelesaikan persamaan 2x + 5 = 11?",
    "messageType": "USER",
    "audioUrl": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "chat-2",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "subchapterId": "persamaan-linear",
    "message": "Untuk menyelesaikan persamaan 2x + 5 = 11...",
    "messageType": "AI",
    "audioUrl": "https://example.com/audio/response.mp3",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 4. Quiz System Endpoints

#### GET /quiz/subchapters/:subchapterId
Mendapatkan atau generate quiz untuk subchapter.

**Parameters:**
- `subchapterId` (string) - Subchapter ID

**Response (200):**
```json
{
  "id": "quiz-persamaan-linear",
  "subchapterId": "persamaan-linear",
  "title": "Quiz: Persamaan Linear",
  "description": "Quiz untuk menguji pemahaman tentang persamaan linear",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "questions": [
    {
      "id": "question-1",
      "question": "Nilai x dari persamaan 3x + 7 = 22 adalah...",
      "options": ["A. 5", "B. 4", "C. 6", "D. 3"]
    },
    {
      "id": "question-2",
      "question": "Persamaan manakah yang merupakan persamaan linear?",
      "options": ["A. x² + 2x = 5", "B. 2x + 3 = 7", "C. x³ - 1 = 0", "D. xy + 2 = 8"]
    }
  ]
}
```

#### POST /quiz/:quizId/submit
Mengirimkan jawaban quiz dan mendapatkan hasil penilaian.

**Parameters:**
- `quizId` (string) - Quiz ID

**Request Body:**
```json
{
  "answers": {
    "question-1": "A",
    "question-2": "B"
  }
}
```

**Response (200):**
```json
{
  "attempt": {
    "id": "attempt-123",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "quizId": "quiz-persamaan-linear",
    "answers": {
      "question-1": "A",
      "question-2": "B"
    },
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
    },
    {
      "questionId": "question-2",
      "question": "Persamaan manakah yang merupakan persamaan linear?",
      "userAnswer": "B",
      "correctAnswer": "B",
      "isCorrect": true,
      "explanation": "Persamaan linear memiliki pangkat tertinggi variabel adalah 1"
    }
  ]
}
```

#### GET /quiz/attempts
Mendapatkan riwayat attempt quiz user.

**Query Parameters:**
- `subchapterId` (optional) - Filter berdasarkan subchapter tertentu

**Response (200):**
```json
[
  {
    "id": "attempt-123",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "quizId": "quiz-persamaan-linear",
    "answers": {...},
    "score": 100,
    "completedAt": "2025-01-01T00:00:00.000Z",
    "quiz": {
      "title": "Quiz: Persamaan Linear",
      "subchapter": {
        "title": "Persamaan Linear",
        "chapter": {
          "title": "Aljabar",
          "subject": {
            "title": "Matematika"
          }
        }
      }
    }
  }
]
```

---

### 5. Progress Tracking Endpoints

#### GET /progress
Mendapatkan progress pembelajaran user.

**Query Parameters:**
- `gradeId` (optional) - Filter berdasarkan grade tertentu

**Response (200):**
```json
[
  {
    "id": "progress-123",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "subchapterId": "persamaan-linear",
    "status": "COMPLETED",
    "completedAt": "2025-01-01T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "subchapter": {
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
  }
]
```

#### GET /progress/summary
Mendapatkan ringkasan statistik progress pembelajaran user.

**Response (200):**
```json
{
  "total": 10,
  "notStarted": 5,
  "inProgress": 2,
  "completed": 3,
  "completionPercentage": 30
}
```

#### GET /progress/subjects/:subjectId
Mendapatkan progress pembelajaran user untuk subject tertentu.

**Parameters:**
- `subjectId` (string) - Subject ID

**Response (200):**
```json
[
  {
    "id": "persamaan-linear",
    "title": "Persamaan Linear",
    "chapterTitle": "Aljabar",
    "status": "COMPLETED",
    "completedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "persamaan-kuadrat",
    "title": "Persamaan Kuadrat",
    "chapterTitle": "Aljabar",
    "status": "IN_PROGRESS",
    "completedAt": null
  }
]
```

---

### 6. Unreal Engine Integration Endpoints

#### GET /unreal/sessions/:subchapterId
Mendapatkan data yang diperlukan untuk sesi Metahuman di Unreal Engine.

**Parameters:**
- `subchapterId` (string) - Subchapter ID

**Response (200):**
```json
{
  "subchapter": {
    "id": "persamaan-linear",
    "title": "Persamaan Linear",
    "subject": "Matematika",
    "grade": "Kelas 10 SMA"
  },
  "content": {
    "text": "Persamaan linear adalah persamaan matematika yang memiliki bentuk ax + b = 0...",
    "audioUrl": "https://example.com/audio/persamaan-linear.mp3"
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
      "audioUrl": "https://example.com/audio/welcome.mp3",
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

#### POST /unreal/sessions/:sessionId/duration
Mengupdate durasi sesi Metahuman setelah selesai.

**Parameters:**
- `sessionId` (string) - Session ID

**Request Body:**
```json
{
  "duration": 450
}
```

**Response (200):**
```json
{
  "success": true
}
```

#### GET /unreal/sessions
Mendapatkan riwayat sesi Metahuman user.

**Query Parameters:**
- `subchapterId` (optional) - Filter berdasarkan subchapter tertentu

**Response (200):**
```json
[
  {
    "id": "session-123",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "subchapterId": "persamaan-linear",
    "sessionData": {...},
    "duration": 300,
    "createdAt": "2025-01-01T00:00:00.000Z",
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

---

### 7. Health Check Endpoints

#### GET /health
Application health check dengan dependency checks.

**Response (200):**
```json
{
  "status": "ok",
  "info": {
    "nestjs-docs": {
      "status": "up"
    },
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "nestjs-docs": {
      "status": "up"
    },
    "database": {
      "status": "up"
    }
  }
}
```

#### GET /health/ready
Readiness probe untuk container orchestration.

#### GET /health/live
Liveness probe untuk monitoring.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 29360128,
    "heapUsed": 20971520,
    "external": 1048576
  }
}
```

---

## 🌐 WebSocket Events

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
**Emit:**
```javascript
socket.emit('joinSession', {
  subchapterId: 'persamaan-linear',
  userId: 'user-id'
});
```

**Listen:**
```javascript
socket.on('sessionData', (data) => {
  // Receive Metahuman session data
  console.log('Session data:', data);
});
```

#### updateProgress
**Emit:**
```javascript
socket.emit('updateProgress', {
  sessionId: 'session-id',
  progress: 75
});
```

**Listen:**
```javascript
socket.on('progressUpdate', (data) => {
  // Receive progress updates from other clients
  console.log('Progress update:', data);
});
```

#### sessionComplete
**Emit:**
```javascript
socket.emit('sessionComplete', {
  sessionId: 'session-id',
  duration: 300
});
```

**Listen:**
```javascript
socket.on('sessionCompleted', (data) => {
  // Session completion confirmation
  console.log('Session completed:', data);
});
```

---

## ❌ Error Responses

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

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
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

### Rate Limiting
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

---

## 🧪 Testing API

### Using cURL

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siswa1@lms.com","password":"siswa123"}'
```

#### Get Grades (with auth)
```bash
curl -X GET http://localhost:3000/api/content/grades \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Ask AI Question
```bash
curl -X POST http://localhost:3000/api/ai/subchapters/persamaan-linear/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"question":"Bagaimana cara menyelesaikan persamaan linear?"}'
```

### Using JavaScript/Axios

```javascript
// Setup axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Get grades
const getGrades = async () => {
  const response = await api.get('/content/grades');
  return response.data;
};

// Ask AI question
const askAI = async (subchapterId, question) => {
  const response = await api.post(`/ai/subchapters/${subchapterId}/ask`, {
    question
  });
  return response.data;
};
```

---

## 📊 Rate Limiting

### Default Limits
- **General API**: 100 requests per minute
- **Auth endpoints**: 5 requests per minute
- **AI endpoints**: 10 requests per minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔒 Security

### Authentication
- JWT tokens expire in 7 days (configurable)
- Tokens must be included in `Authorization` header
- Format: `Bearer <token>`

### CORS
- Configurable origins via `CORS_ORIGIN` environment variable
- Supports credentials
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

### Rate Limiting
- IP-based rate limiting
- Different limits for different endpoint groups
- Configurable via environment variables

### Input Validation
- All inputs validated using class-validator
- Request sanitization enabled
- SQL injection protection via ORM

---

## 📈 Performance

### Response Times
- Average response time: < 200ms
- Database queries: < 50ms
- AI generation: 2-5 seconds
- File uploads: Varies by size

### Caching
- Static content caching
- Database query result caching (planned)
- Redis integration (optional)

### Compression
- Gzip compression enabled
- Reduces response size by ~70%

---

## 🐛 Troubleshooting

### Common Issues

#### 401 Unauthorized
- Check if JWT token is valid and not expired
- Ensure token is included in Authorization header
- Verify token format: `Bearer <token>`

#### 403 Forbidden
- Check user role permissions
- Admin-only endpoints require ADMIN role
- Verify user has access to requested resource

#### 404 Not Found
- Verify endpoint URL is correct
- Check if resource exists in database
- Ensure proper HTTP method is used

#### 429 Too Many Requests
- Reduce request frequency
- Implement exponential backoff
- Check rate limiting configuration

#### 500 Internal Server Error
- Check server logs for detailed error
- Verify database connection
- Check external service availability (OpenAI, ElevenLabs)

### Debug Mode
Set `NODE_ENV=development` untuk detailed error messages dan stack traces.

---

## 📞 Support

Untuk pertanyaan dan support:
- **Email**: api-support@lms.com
- **Documentation**: [Link to full docs]
- **GitHub Issues**: [Repository issues]
- **Slack**: #api-support

---

**API Documentation v1.0.0** | Last updated: January 2025