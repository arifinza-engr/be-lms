# LMS Backend - Learning Management System

## 📋 Deskripsi

LMS Backend adalah sistem backend untuk Learning Management System yang dibangun dengan NestJS dan Drizzle ORM. Sistem ini menyediakan API lengkap untuk platform pembelajaran online dengan integrasi AI ChatGPT dan dukungan Metahuman Unreal Engine.

## ✨ Fitur Utama

### 🔐 Autentikasi & Otorisasi
- JWT-based authentication
- Role-based access control (SISWA/ADMIN)
- Password hashing dengan bcrypt
- Session management

### 📚 Manajemen Konten
- Struktur hierarkis: Grade → Subject → Chapter → Subchapter
- CRUD operations untuk semua entitas konten
- Relasi data yang terstruktur

### 🤖 Integrasi AI
- **OpenAI GPT Integration**: Generate konten pembelajaran otomatis
- **ElevenLabs TTS**: Text-to-speech untuk audio pembelajaran
- **AI Chat Interface**: Interaksi real-time dengan AI teacher
- **Quiz Generator**: Generate quiz otomatis berdasarkan materi

### 📊 Progress Tracking
- User progress tracking per subchapter
- Status pembelajaran (NOT_STARTED, IN_PROGRESS, COMPLETED)
- Progress summary dan analytics
- Achievement system

### 🎯 Sistem Quiz
- Quiz generator otomatis menggunakan AI
- Multiple choice questions
- Scoring dan feedback system
- Quiz attempt history

### 🎭 Integrasi Unreal Engine
- Metahuman session management
- WebSocket untuk real-time communication
- Session data untuk Unreal Engine integration

### 🔒 Keamanan & Performance
- Rate limiting dengan Throttler
- Input validation dan sanitization
- CORS configuration
- Helmet security headers
- Compression middleware
- Health check endpoints

## 🛠 Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL dengan Drizzle ORM
- **Authentication**: JWT dengan Passport
- **WebSocket**: Socket.IO
- **AI Integration**: OpenAI GPT, ElevenLabs
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker

## 📦 Instalasi

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 14
- Redis (optional, untuk caching)

### 1. Clone Repository
```bash
git clone <repository-url>
cd lms-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi yang sesuai:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# ElevenLabs Configuration (Optional)
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
ELEVENLABS_VOICE_ID="your-voice-id"

# Server Configuration
PORT=3000
NODE_ENV="development"
```

### 4. Database Setup
```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed database dengan data sample
npx tsx src/database/seed.ts
```

### 5. Start Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Content Management
- `GET /api/content/grades` - Get all grades
- `GET /api/content/grades/:id` - Get grade by ID
- `POST /api/content/grades` - Create grade (Admin only)
- `GET /api/content/subjects/:subjectId/chapters` - Get chapters by subject
- `POST /api/content/chapters` - Create chapter (Admin only)
- `GET /api/content/subchapters/:id` - Get subchapter details

### AI Interaction
- `GET /api/ai/subchapters/:id/content` - Get/generate AI content
- `POST /api/ai/subchapters/:id/ask` - Ask question to AI
- `GET /api/ai/subchapters/:id/chat-history` - Get chat history

### Quiz System
- `GET /api/quiz/subchapters/:id` - Get/generate quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/quiz/attempts` - Get user quiz attempts

### Progress Tracking
- `GET /api/progress` - Get user progress
- `GET /api/progress/summary` - Get progress summary
- `GET /api/progress/subjects/:id` - Get subject progress

### Unreal Engine Integration
- `GET /api/unreal/sessions/:id` - Get Metahuman session data
- `POST /api/unreal/sessions/:id/duration` - Update session duration
- `GET /api/unreal/sessions` - Get session history

### Health Check
- `GET /api/health` - Application health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## 📖 API Documentation

Dokumentasi API lengkap tersedia di:
- **Swagger UI**: `http://localhost:3000/docs` (development)
- **API Reference**: Lihat file `API.md` untuk dokumentasi detail

## 🗄 Database Schema

### Entitas Utama

#### Users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `name` (String)
- `role` (Enum: SISWA, ADMIN)

#### Content Hierarchy
- **Grades**: Tingkat kelas (e.g., Kelas 10 SMA)
- **Subjects**: Mata pelajaran (e.g., Matematika, Fisika)
- **Chapters**: Bab dalam mata pelajaran
- **Subchapters**: Sub-bab dalam chapter

#### AI & Learning
- **AI Generated Content**: Konten pembelajaran yang digenerate AI
- **AI Chat Logs**: Riwayat percakapan dengan AI
- **User Progress**: Progress pembelajaran user
- **Quizzes & Questions**: Sistem quiz dan pertanyaan
- **Quiz Attempts**: Riwayat attempt quiz user

#### Unreal Engine
- **Metahuman Sessions**: Data sesi Metahuman

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring & Logging

### Health Checks
- Application health: `/api/health`
- Database connectivity: `/api/health/ready`
- Liveness probe: `/api/health/live`

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking
- Performance monitoring

### Metrics
- Response times
- Error rates
- Database query performance
- API usage statistics

## 🔧 Development

### Database Operations
```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:push

# Open database studio
npm run db:studio

# Reset database
npm run db:drop
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npx tsc --noEmit
```

## 🚀 Production Deployment

### Environment Variables
Pastikan semua environment variables production sudah dikonfigurasi:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-production-secret>
OPENAI_API_KEY=<production-openai-key>
CORS_ORIGIN=<frontend-domain>
```

### Performance Optimization
- Enable compression
- Configure rate limiting
- Set up database connection pooling
- Enable caching (Redis)
- Configure CDN untuk static assets

### Security Checklist
- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Database credentials secured
- [ ] API keys secured

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests untuk new features
- Update documentation
- Follow conventional commit messages
- Ensure code passes linting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Developer**: [Your Name]
- **AI Integration**: [AI Specialist]
- **DevOps**: [DevOps Engineer]

## 📞 Support

Untuk support dan pertanyaan:
- Email: support@lms.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Complete API implementation
- ✅ AI integration (OpenAI + ElevenLabs)
- ✅ WebSocket support
- ✅ Docker containerization
- ✅ Comprehensive documentation

### Roadmap
- [ ] Redis caching implementation
- [ ] Advanced analytics dashboard
- [ ] Mobile app API optimization
- [ ] Multi-language support
- [ ] Advanced AI features
- [ ] Performance monitoring dashboard

---

**Happy Learning! 🎓**