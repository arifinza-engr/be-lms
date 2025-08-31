# Frontend Development Guide - Zona Ajar LMS

## 📋 Table of Contents

1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Frontend Technology Stack](#frontend-technology-stack)
3. [Project Structure](#project-structure)
4. [Authentication System](#authentication-system)
5. [Module-Based Development](#module-based-development)
6. [Page Development Prompts](#page-development-prompts)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Real-time Features](#real-time-features)
10. [Security Implementation](#security-implementation)
11. [Performance Optimization](#performance-optimization)
12. [Testing Strategy](#testing-strategy)
13. [Development Roadmap](#development-roadmap)

---

## 🏗️ Backend Architecture Overview

### Database Schema & Relations

```
users (ADMIN, GURU, SISWA)
├── grades (Kelas 10, 11, 12)
    ├── subjects (Matematika, Fisika, Kimia, Biologi)
        ├── chapters (Aljabar, Geometri, Trigonometri)
            ├── subchapters (Persamaan Linear, dll)
                ├── aiGeneratedContent (AI-generated explanations)
                ├── aiChatLogs (Chat history dengan AI)
                ├── quizzes (Quiz per subchapter)
                │   └── quizQuestions (Multiple choice questions)
                ├── userProgress (Progress tracking)
                ├── quizAttempts (Quiz submissions & results)
                └── metahumanSessions (Unreal Engine sessions)
```

### Backend Technology Stack

- **NestJS** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Redis** for caching and rate limiting
- **JWT** authentication with refresh tokens
- **OpenAI GPT-3.5** for AI content generation
- **ElevenLabs** for text-to-speech
- **Socket.io** for WebSocket (Unreal Engine integration)
- **Swagger** for API documentation

### Available API Endpoints

#### Authentication (`/auth`)

- `POST /auth/register` - User registration
- `POST /auth/login` - Login with JWT tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password

#### Content Management (`/content`)

- `GET /content/grades` - Get all grades
- `GET /content/grades/:gradeId/subjects` - Get subjects by grade
- `GET /content/subjects/:subjectId/chapters` - Get chapters by subject
- `GET /content/chapters/:chapterId/subchapters` - Get subchapters
- CRUD operations for all content (Admin only)

#### File Upload & Materials (`/content`)

- `POST /content/subchapters/:id/materials` - Upload learning materials (videos, PDFs, images, documents)
- `GET /content/subchapters/:id/materials` - Get all materials for a subchapter
- `GET /content/subchapters/:id/complete` - Get subchapter with AI content + materials
- `GET /content/subchapters/:id/materials/type/:type` - Filter materials by type
- `GET /content/materials/:id` - Get specific material details
- `PUT /content/materials/:id` - Update material metadata
- `DELETE /content/materials/:id` - Delete material (Admin/Teacher only)
- `GET /content/materials/stats` - Get materials statistics (Admin only)

#### AI Services (`/ai`)

- `GET /ai/subchapters/:id/content` - Get/generate AI content
- `POST /ai/subchapters/:id/ask` - Ask AI questions
- `GET /ai/subchapters/:id/chat-history` - Get chat history

#### Quiz System (`/quiz`)

- `GET /quiz/subchapters/:id` - Get quiz for subchapter
- `POST /quiz/:id/submit` - Submit quiz answers
- `GET /quiz/attempts` - Get user quiz attempts
- CRUD operations for quiz management (Admin only)

#### Progress Tracking (`/progress`)

- `GET /progress` - Get user progress
- `GET /progress/summary` - Get progress summary
- `GET /progress/subjects/:id` - Get subject progress

#### Unreal Engine Integration (`/unreal`)

- `GET /unreal/sessions/:subchapterId` - Get Metahuman session data
- `POST /unreal/sessions/:id/duration` - Update session duration
- WebSocket namespace `/unreal` for real-time communication

---

## 🛠️ Frontend Technology Stack

### Core Framework

```typescript
// Primary Stack
React 18 + TypeScript
Next.js 14 (App Router)
Tailwind CSS + Headless UI

// State Management
Zustand (lightweight, perfect for LMS)
React Query/TanStack Query (server state)

// HTTP Client & WebSocket
Axios with interceptors
Socket.io-client for Unreal integration

// UI Components
Radix UI primitives
Framer Motion for animations
React Hook Form + Zod validation

// Audio & Media
Howler.js for audio playback (ElevenLabs)
React Player for media content

// Charts & Analytics
Recharts for progress visualization
React Countup for statistics

// Development Tools
ESLint + Prettier
Husky for git hooks
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth layout group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Main app layout
│   │   ├── admin/         # Admin interface
│   │   ├── teacher/       # Teacher interface
│   │   └── student/       # Student interface
│   └── layout.tsx
├── components/
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   ├── charts/           # Analytics components
│   └── layout/           # Layout components
├── lib/
│   ├── api/              # API client & services
│   ├── auth/             # Authentication logic
│   ├── stores/           # Zustand stores
│   └── utils/            # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
└── constants/            # App constants
```

---

## 🔐 Authentication System

### Auth Store Implementation

```typescript
// lib/auth/auth-store.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

// Features:
// - Automatic token refresh with Axios interceptors
// - Role-based routing with middleware
// - Secure token storage (httpOnly cookies recommended)
```

---

## 🎯 Module-Based Development

### User Interfaces by Role

#### Student Interface (SISWA)

- **Dashboard**: Progress overview, recent activity, achievements
- **Learning Interface**: AI content viewer, chat widget, audio player
- **Quiz Interface**: Interactive quizzes with timer and results
- **Progress Tracking**: Personal analytics and achievements

#### Teacher Interface (GURU)

- **Analytics Dashboard**: Student progress, performance metrics
- **Student Management**: Class roster, individual reports
- **Content Analytics**: Usage statistics, difficulty areas
- **Communication Tools**: Messaging and announcements

#### Admin Interface (ADMIN)

- **Content Management**: CRUD operations for all content
- **User Management**: Manage students, teachers, permissions
- **Quiz Management**: Create/edit quizzes and questions
- **System Analytics**: Usage statistics, performance monitoring

---

## 📄 Page Development Prompts

### Authentication Module Pages

#### 1. Login Page

```
Create a modern login page for the Zona Ajar LMS with the following specifications:

**Requirements:**
- Use Next.js 14 App Router with TypeScript
- Implement with React Hook Form + Zod validation
- Style with Tailwind CSS and Radix UI components
- Include role-based login (ADMIN, GURU, SISWA)
- Add "Remember Me" functionality
- Include "Forgot Password" link
- Show loading states and error handling
- Responsive design for mobile and desktop

**API Integration:**
- POST /auth/login endpoint
- Handle JWT tokens (access + refresh)
- Store tokens securely
- Redirect based on user role

**Design Elements:**
- Clean, modern interface
- School/education theme
- Form validation with real-time feedback
- Success/error toast notifications
- Smooth animations with Framer Motion

**Example credentials for testing:**
- Admin: admin@lms.com / Admin123!@#
- Teacher: guru1@lms.com / Guru123!@#
- Student: siswa1@lms.com / Siswa123!@#
```

#### 2. Register Page

```
Create a user registration page for the Zona Ajar LMS with the following specifications:

**Requirements:**
- Multi-step registration form
- Role selection (SISWA, GURU - ADMIN created by existing admin)
- Email verification flow
- Password strength indicator
- Terms and conditions acceptance
- Form validation with Zod schema

**API Integration:**
- POST /auth/register endpoint
- Handle validation errors
- Email verification process
- Auto-redirect to login after success

**Form Fields:**
- Email (with validation)
- Password (with strength meter)
- Confirm Password
- Full Name
- Role Selection
- Terms acceptance checkbox

**Design:**
- Step-by-step wizard interface
- Progress indicator
- Smooth transitions between steps
- Mobile-responsive design
```

#### 3. Password Reset Pages

```
Create password reset flow pages (request + reset) for Zona Ajar LMS:

**Forgot Password Page:**
- Email input with validation
- Rate limiting indicator
- Clear instructions
- Link back to login

**Reset Password Page:**
- Token validation
- New password form with strength meter
- Confirm password field
- Success confirmation

**API Integration:**
- POST /auth/forgot-password
- POST /auth/reset-password
- Handle expired/invalid tokens
- Proper error messaging
```

### Student Module Pages

#### 4. Student Dashboard

```
Create a comprehensive student dashboard for Zona Ajar LMS:

**Components Required:**
- Welcome header with user info
- Learning progress overview (circular progress charts)
- Recent activity feed
- Quick access to subjects/grades
- Achievement badges display
- Continue learning button
- Upcoming quizzes notification
- Study streak counter

**Data Integration:**
- GET /progress for user progress
- GET /progress/summary for overview stats
- GET /content/grades for available content
- Real-time updates for progress

**Features:**
- Interactive progress charts (Recharts)
- Smooth animations for counters
- Responsive grid layout
- Dark/light mode support
- Quick navigation shortcuts

**Design:**
- Card-based layout
- Modern, clean interface
- Educational color scheme
- Mobile-first responsive design
```

#### 5. Content Browser (Hierarchical Navigation)

```
Create a hierarchical content browser for students:

**Navigation Structure:**
- Grade Selection → Subject Selection → Chapter Selection → Subchapter Learning
- Breadcrumb navigation
- Progress indicators at each level
- Search and filter functionality

**Features:**
- Tree view with expand/collapse
- Progress badges on each item
- Bookmark/favorites system
- Continue from last position
- Estimated time to complete

**API Integration:**
- GET /content/grades
- GET /content/grades/:id/subjects
- GET /content/subjects/:id/chapters
- GET /content/chapters/:id/subchapters
- GET /progress for completion status

**UI Elements:**
- Collapsible tree structure
- Progress rings/bars
- Search with autocomplete
- Filter by completion status
- Responsive card/list view toggle
```

#### 6. Enhanced Learning Interface (AI + Materials)

```
Create a comprehensive learning interface combining AI content and uploaded materials:

**Main Components:**
- AI-generated content viewer (rich text/markdown)
- Materials viewer (videos, PDFs, images, documents)
- Floating AI chat widget
- Audio player for text-to-speech (ElevenLabs)
- Progress tracker
- Navigation controls (prev/next subchapter)

**🚀 NEW: File Upload & Materials Support:**
- Backend now supports file uploads for learning materials
- Support for videos (.mp4, .avi, .mov), PDFs, images, documents
- Materials are organized by subchapter
- Teachers can upload supplementary materials
- Students can access both AI content and uploaded materials

**Materials Features:**
- Video player with controls and thumbnails
- PDF viewer with zoom and navigation
- Image gallery with lightbox
- Document download functionality
- Filter materials by type (video, pdf, image, document)
- Material metadata display (title, description, file size)

**AI Chat Features:**
- Real-time chat with AI assistant
- Message history persistence
- Typing indicators
- Audio playback for AI responses
- Rate limiting indicators
- Chat history sidebar

**API Integration:**
- GET /ai/subchapters/:id/content - AI-generated content
- GET /content/subchapters/:id/complete - Complete content (AI + materials)
- GET /content/subchapters/:id/materials - Get materials only
- GET /content/subchapters/:id/materials/type/:type - Filter by type
- POST /ai/subchapters/:id/ask - Chat with AI
- GET /ai/subchapters/:id/chat-history - Chat history

**Design:**
- Tabbed interface (AI Content | Materials | Chat)
- Split-screen layout option
- Material type icons and previews
- Responsive media players
- Mobile-optimized interface
- Smooth transitions between content types
```

#### 7. Quiz Interface

```
Create an interactive quiz interface for students:

**Quiz Components:**
- Quiz timer with countdown
- Question cards with multiple choice
- Progress indicator
- Review panel before submission
- Results modal with detailed feedback

**Features:**
- Auto-save answers
- Time tracking per question
- Review mode (flag questions)
- Immediate feedback after submission
- Detailed explanations for answers
- Score visualization

**API Integration:**
- GET /quiz/subchapters/:id
- POST /quiz/:id/submit
- GET /quiz/attempts for history

**UI Elements:**
- Card-based question layout
- Circular timer
- Progress bar
- Answer selection with animations
- Results dashboard with charts
- Mobile-optimized interface
```

#### 8. Student Progress Analytics

```
Create a detailed progress analytics page for students:

**Analytics Components:**
- Overall completion percentage
- Subject-wise progress charts
- Quiz performance trends
- Learning streak tracking
- Time spent analytics
- Achievement showcase

**Visualizations:**
- Donut charts for completion rates
- Line charts for progress over time
- Bar charts for quiz scores
- Heatmap for daily activity
- Achievement badges grid

**API Integration:**
- GET /progress
- GET /progress/summary
- GET /quiz/attempts
- Historical data aggregation

**Features:**
- Interactive charts (Recharts)
- Date range filtering
- Export progress reports
- Goal setting and tracking
- Responsive dashboard layout
```

### Teacher Module Pages

#### 9. Teacher Dashboard

```
Create a comprehensive teacher dashboard:

**Dashboard Components:**
- Class overview statistics
- Student progress summary
- Recent student activities
- Quiz performance analytics
- Content usage statistics
- Quick action buttons

**Features:**
- Multi-class support
- Real-time student progress
- Performance alerts
- Content effectiveness metrics
- Student engagement tracking

**API Integration:**
- GET /progress for all students
- Aggregated analytics data
- Real-time updates via WebSocket

**Design:**
- Professional, clean interface
- Data-rich visualizations
- Responsive grid layout
- Export functionality
```

#### 10. Material Upload & Management Interface (Teachers)

```
Create a comprehensive material upload and management interface for teachers:

**🚀 NEW: File Upload Components:**
- Drag-and-drop file upload area
- Multi-file selection support
- Upload progress indicators
- File type validation (videos, PDFs, images, documents)
- File size limit indicators
- Thumbnail generation for videos/images

**Material Management Features:**
- Material library with grid/list view
- Search and filter by file type
- Bulk operations (delete, update metadata)
- Material preview functionality
- Usage statistics per material
- Student access analytics

**Upload Form Components:**
- File selection with drag-and-drop
- Title and description fields
- File type auto-detection
- Upload progress with cancel option
- Success/error notifications
- Batch upload support

**API Integration:**
- POST /content/subchapters/:id/materials - Upload materials
- GET /content/subchapters/:id/materials - Get materials
- PUT /content/materials/:id - Update material metadata
- DELETE /content/materials/:id - Delete materials
- GET /content/materials/stats - Usage statistics

**Design Elements:**
- Modern file upload interface
- Material cards with previews
- Progress bars and loading states
- Responsive grid layout
- File type icons and badges
- Mobile-optimized upload flow

**File Type Support:**
- Videos: .mp4, .avi, .mov, .wmv
- Documents: .pdf, .doc, .docx, .ppt, .pptx
- Images: .jpg, .jpeg, .png, .gif, .webp
- Archives: .zip, .rar (if needed)
```

#### 11. Student Management Interface

```
Create a student management interface for teachers:

**Components:**
- Student list with search/filter
- Individual progress reports
- Performance comparison tools
- Communication interface
- Attendance tracking

**Features:**
- Bulk operations
- Progress comparison charts
- Individual student drill-down
- Export student reports
- Communication history

**Data Visualization:**
- Student progress tables
- Comparative charts
- Performance heatmaps
- Trend analysis graphs

**API Integration:**
- Student data aggregation
- Progress tracking APIs
- Communication endpoints
```

### Admin Module Pages

#### 11. Content & Material Management System (Admin)

```
Create a comprehensive content and material management system for admins:

**Content Management Features:**
- Hierarchical content tree (Grade → Subject → Chapter → Subchapter)
- CRUD operations for all content levels
- Bulk operations and import/export
- Content preview functionality
- Version control for content

**🚀 NEW: Material Management Features:**
- Global material library across all subchapters
- Material usage analytics and statistics
- Bulk material operations (move, delete, update)
- Material approval workflow (if needed)
- Storage usage monitoring
- File type and size analytics

**Material Analytics Dashboard:**
- Total storage usage by file type
- Most accessed materials
- Upload trends over time
- Teacher upload statistics
- Student engagement with materials
- Storage optimization recommendations

**Components:**
- Tree view with drag-and-drop reordering
- Rich text editor for descriptions
- Material library with advanced filters
- Upload statistics dashboard
- Bulk action toolbar
- Content and material status indicators

**API Integration:**
- Full CRUD operations for all content endpoints
- GET /content/materials/stats - Material statistics
- Material management endpoints
- Bulk operations support
- Content validation

**UI Elements:**
- Collapsible tree structure
- Material grid with previews
- Statistics charts and graphs
- Modal forms for editing
- Confirmation dialogs
- Progress indicators for bulk operations
- Responsive table/card views
```

#### 12. Quiz Management System

```
Create a quiz management system for admins:

**Features:**
- Quiz builder with drag-and-drop
- Question bank management
- AI-powered quiz generation
- Quiz analytics and reporting
- Bulk quiz operations

**Components:**
- Quiz creation wizard
- Question editor with rich text
- Answer option management
- Quiz preview functionality
- Analytics dashboard

**API Integration:**
- Quiz CRUD operations
- Question management
- AI quiz generation endpoint
- Analytics data

**Design:**
- Intuitive quiz builder interface
- Question bank with search
- Preview mode for quizzes
- Analytics charts and reports
```

#### 13. User Management Interface

```
Create a user management interface for admins:

**Features:**
- User table with advanced filtering
- Role management and permissions
- Bulk user operations
- User activity monitoring
- Account status management

**Components:**
- Searchable user table
- User creation/edit forms
- Role assignment interface
- Activity timeline
- Bulk action toolbar

**API Integration:**
- User CRUD operations
- Role management
- Activity tracking
- Bulk operations

**Design:**
- Data table with sorting/filtering
- Modal forms for user operations
- Status indicators
- Activity visualizations
```

#### 14. System Analytics Dashboard

```
Create a comprehensive system analytics dashboard for admins:

**Analytics Components:**
- User engagement metrics
- Content usage statistics
- Quiz performance analytics
- System performance monitoring
- Revenue/usage reports

**Visualizations:**
- Real-time metrics dashboard
- Historical trend analysis
- User behavior heatmaps
- Content effectiveness charts
- System health indicators

**Features:**
- Real-time data updates
- Custom date range filtering
- Export functionality
- Alert system for anomalies
- Mobile-responsive design

**API Integration:**
- System metrics endpoints
- Real-time data via WebSocket
- Historical data aggregation
```

### Shared Components & Features

#### 15. Unreal Engine Integration Interface

```
Create WebSocket-based Unreal Engine integration interface:

**Features:**
- 3D learning environment launcher
- Metahuman session management
- Real-time progress synchronization
- Session recording and playback

**Components:**
- 3D viewport embed
- Session controls
- Progress indicators
- Communication interface

**WebSocket Integration:**
- Socket.io client setup
- Real-time session data
- Progress updates
- Connection management

**API Integration:**
- GET /unreal/sessions/:subchapterId
- POST /unreal/sessions/:id/duration
- WebSocket namespace /unreal
```

#### 16. Audio Player Component

```
Create an advanced audio player for ElevenLabs TTS:

**Features:**
- Play/pause controls
- Progress bar with scrubbing
- Speed control (0.5x to 2x)
- Volume control
- Playlist support for multiple audio clips

**Components:**
- Custom audio controls
- Waveform visualization
- Playlist interface
- Loading states

**Integration:**
- ElevenLabs audio URLs
- Howler.js for audio management
- Responsive design
```

#### 17. Real-time Notification System

```
Create a real-time notification system:

**Features:**
- Toast notifications
- In-app notification center
- Real-time updates via WebSocket
- Notification preferences

**Components:**
- Notification bell with badge
- Notification dropdown
- Toast container
- Settings panel

**Integration:**
- WebSocket for real-time updates
- Local storage for preferences
- API for notification history
```

---

## 🗄️ State Management

### Zustand Store Architecture

```typescript
// Global State Structure
interface AppStore {
  auth: AuthSlice;
  content: ContentSlice;
  materials: MaterialsSlice; // 🚀 NEW: Materials state management
  progress: ProgressSlice;
  quiz: QuizSlice;
  ai: AISlice;
  ui: UISlice;
}

// 🚀 NEW: Materials Store Slice
interface MaterialsSlice {
  materials: Material[];
  uploadProgress: Record<string, number>;
  filters: MaterialFilters;
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  setUploadProgress: (fileId: string, progress: number) => void;
  setFilters: (filters: MaterialFilters) => void;
}

// React Query for Server State
- Content hierarchy caching
- Materials data with infinite scroll
- Progress data synchronization
- Quiz attempts caching
- AI chat history
- Real-time updates
- File upload progress tracking
```

---

## 🌐 API Integration

### HTTP Client Setup

```typescript
// Axios Configuration
- Base URL configuration
- Request/response interceptors
- Automatic token refresh
- Error handling
- Request/response logging
- File upload progress tracking

// React Query Setup
- Query client configuration
- Cache invalidation strategies
- Optimistic updates
- Background refetching
- File upload mutations
```

### 🚀 NEW: TypeScript Types for Materials

```typescript
// Material Types
interface Material {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileType: 'video' | 'pdf' | 'image' | 'document';
  fileSize: number;
  mimeType: string;
  duration?: number; // For videos
  thumbnailUrl?: string; // For videos/images
  uploadedBy: {
    id: string;
    name: string;
    role: 'ADMIN' | 'GURU';
  };
  createdAt: string;
  updatedAt: string;
}

// Upload Types
interface UploadMaterialDto {
  title: string;
  description?: string;
  file: File;
}

interface UpdateMaterialDto {
  title?: string;
  description?: string;
}

// Response Types
interface MaterialsResponse {
  materials: Material[];
  total: number;
  page: number;
  limit: number;
}

interface SubchapterCompleteResponse {
  id: string;
  title: string;
  description: string;
  aiGeneratedContent: AIContent[];
  materials: Material[];
}

interface MaterialsStats {
  video?: { count: number; totalSize: number };
  pdf?: { count: number; totalSize: number };
  image?: { count: number; totalSize: number };
  document?: { count: number; totalSize: number };
}

// Filter Types
interface MaterialFilters {
  fileType?: 'video' | 'pdf' | 'image' | 'document';
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

// Upload Progress Types
interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}
```

---

## ⚡ Real-time Features

### WebSocket Implementation

```typescript
// Socket.io Integration
- Connection management
- Real-time progress updates
- Live chat notifications
- Unreal Engine communication
- Connection state handling

// Optimistic Updates
- Immediate UI feedback
- Background synchronization
- Conflict resolution
```

---

## 📁 File Upload Implementation

### 🚀 NEW: File Upload Components

```typescript
// File Upload Hook
const useFileUpload = (subchapterId: string) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  const uploadMaterial = async (file: File, metadata: UploadMaterialDto) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    return axios.post(`/content/subchapters/${subchapterId}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      }
    });
  };

  return { uploadMaterial, uploadProgress, uploading };
};

// Drag and Drop Component
const FileDropzone = ({ onFilesSelected, accept, maxSize }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    onFilesSelected(files);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        Drag and drop files here, or click to select
      </p>
    </div>
  );
};

// File Preview Component
const FilePreview = ({ file, onRemove }) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (type === 'application/pdf') return <FileText className="h-8 w-8" />;
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
      {getFileIcon(file.type)}
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>
      <button onClick={onRemove} className="text-red-500 hover:text-red-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
```

### File Upload Validation

```typescript
// File validation utilities
const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 100MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
};

// Batch upload with progress tracking
const useBatchUpload = () => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const uploadFiles = async (files: File[], subchapterId: string) => {
    const uploadPromises = files.map(async (file) => {
      const uploadId = `${file.name}-${Date.now()}`;

      setUploads((prev) => [
        ...prev,
        {
          fileId: uploadId,
          fileName: file.name,
          progress: 0,
          status: 'uploading',
        },
      ]);

      try {
        await uploadMaterial(file, { title: file.name }, subchapterId);
        setUploads((prev) =>
          prev.map((upload) =>
            upload.fileId === uploadId
              ? { ...upload, status: 'completed', progress: 100 }
              : upload,
          ),
        );
      } catch (error) {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.fileId === uploadId
              ? { ...upload, status: 'error', error: error.message }
              : upload,
          ),
        );
      }
    });

    await Promise.allSettled(uploadPromises);
  };

  return { uploads, uploadFiles };
};
```

---

## 🔒 Security Implementation

### Frontend Security Measures

```typescript
// Security Features
- XSS protection with DOMPurify
- CSRF token handling
- Secure token storage
- Input validation with Zod
- Rate limiting indicators
- Content Security Policy
```

---

## 🚀 Performance Optimization

### Optimization Strategies

```typescript
// Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports for heavy components

// Caching Strategy
- React Query for API caching
- Service Worker for offline support
- Image optimization with Next.js

// Bundle Optimization
- Tree shaking
- Webpack bundle analyzer
- Dynamic imports
```

---

## 🧪 Testing Strategy

### Testing Stack

```typescript
// Testing Tools
- Jest + React Testing Library
- Cypress for E2E testing
- MSW for API mocking
- Storybook for component testing

// Test Coverage Areas
- Authentication flows
- Content navigation
- File upload functionality
- Material viewer components
- Quiz functionality
- AI chat interface
- Progress tracking
```

---

## 📅 Development Roadmap

### Phase 1: Foundation (3-4 weeks)

1. Setup Next.js project with TypeScript
2. Implement authentication system
3. Create basic layout and routing
4. Setup API client with interceptors
5. Implement role-based access control

### Phase 2: Content Management (4-5 weeks)

1. Build hierarchical content browser
2. Implement enhanced content viewer (AI + Materials)
3. Create admin content management interface
4. Add search and filtering
5. Implement progress tracking

### 🚀 NEW: Phase 2.5: File Upload & Materials (2-3 weeks)

1. Build drag-and-drop file upload interface
2. Implement material viewer components (video, PDF, image)
3. Create material management dashboard for teachers
4. Add file type filtering and search
5. Implement upload progress tracking
6. Build material analytics for admins

### Phase 3: AI Integration (3-4 weeks)

1. Build chat interface with AI
2. Implement audio player for TTS
3. Add chat history management
4. Create rate limiting indicators
5. Optimize AI response handling

### Phase 4: Quiz System (3-4 weeks)

1. Build interactive quiz interface
2. Implement timer and progress tracking
3. Create results dashboard
4. Add quiz management for admin
5. Implement quiz analytics

### Phase 5: Analytics & Progress (3-4 weeks)

1. Build progress visualization
2. Create analytics dashboards
3. Implement reporting system
4. Add achievement system
5. Create performance metrics

### Phase 6: Advanced Features (4-5 weeks)

1. WebSocket integration for Unreal Engine
2. Real-time notifications
3. Advanced search and recommendations
4. Performance optimizations
5. Mobile responsiveness

### Phase 7: Testing & Deployment (2-3 weeks)

1. Comprehensive testing
2. Performance optimization
3. Security audit
4. Deployment setup
5. Documentation

---

## 🎯 Unique Features

This LMS frontend will include several cutting-edge features:

1. **AI-Powered Learning**: Real-time AI assistance with chat interface
2. **🚀 NEW: Hybrid Content System**: AI-generated content + uploaded materials (videos, PDFs, documents)
3. **🚀 NEW: Advanced File Management**: Drag-and-drop uploads with progress tracking
4. **Voice Synthesis**: Audio learning with ElevenLabs integration
5. **3D Learning Environment**: Unreal Engine integration with Metahuman
6. **Advanced Analytics**: Comprehensive progress tracking and reporting
7. **Real-time Collaboration**: WebSocket-based real-time features
8. **🚀 NEW: Multi-Media Learning**: Video players, PDF viewers, image galleries
9. **Adaptive Learning**: Personalized learning paths based on progress
10. **Gamification**: Achievement system and learning streaks
11. **Offline Support**: Service Worker for offline learning capabilities

## 🚀 **NEW: Enhanced Backend Capabilities**

**HYBRID CONTENT SYSTEM:**

- ✅ Backend now supports file uploads (videos, PDFs, documents, images)
- ✅ AI-generated content from OpenAI (existing feature)
- ✅ Audio content via ElevenLabs TTS (existing feature)
- ✅ Traditional file-based learning materials (NEW)
- ✅ Document viewer, video player, and file management needed in frontend (NEW)

**Enhanced Content Architecture:**

- Subchapters contain: title, description, order, AI content, AND uploaded materials
- AI generates educational content dynamically (existing)
- Teachers can upload supplementary materials (NEW)
- Students access both AI content and uploaded materials (NEW)
- Hybrid learning experience combining AI and traditional materials (NEW)

---

## 📝 Development Notes

- **Mobile-First**: All interfaces should be designed mobile-first
- **Accessibility**: Follow WCAG 2.1 guidelines for accessibility
- **Performance**: Optimize for fast loading and smooth interactions
- **Scalability**: Design components for reusability and maintainability
- **Security**: Implement proper security measures throughout
- **Testing**: Maintain high test coverage for critical functionality

---

## 📚 API Documentation & Testing

### Swagger Documentation

The backend provides comprehensive API documentation via Swagger UI:

**🔗 Access Swagger Documentation:**

- **Development**: `http://localhost:3000/api/docs`
- **Production**: `https://your-domain.com/api/docs`

**📋 Swagger Features:**

- ✅ Interactive API testing interface
- ✅ Complete endpoint documentation with examples
- ✅ Request/response schemas with TypeScript types
- ✅ Authentication testing with JWT tokens
- ✅ File upload interface for materials
- ✅ Error response examples
- ✅ Real-time API testing

**🚀 NEW: Enhanced Swagger Documentation:**

- **File Upload & Materials** section with drag-and-drop testing
- **Complete API examples** with real data
- **TypeScript-compatible** response schemas
- **Interactive file upload** testing interface
- **Material filtering** and management endpoints
- **Statistics endpoints** for analytics

**📖 API Sections in Swagger:**

1. **Authentication** - Login, register, password management
2. **Content Management** - CRUD operations for educational content
3. **🚀 File Upload & Materials** - Upload and manage learning materials
4. **AI Services** - AI content generation and chat
5. **Quiz System** - Quiz management and submissions
6. **Progress Tracking** - Student progress analytics
7. **Unreal Engine** - 3D learning environment integration

### Frontend Development Workflow

1. **Explore APIs**: Use Swagger UI to understand available endpoints
2. **Test Authentication**: Test JWT token flow in Swagger
3. **Generate Types**: Extract TypeScript types from Swagger schemas
4. **Test File Uploads**: Use Swagger's file upload interface
5. **Implement Frontend**: Build React components using tested APIs
6. **Handle Errors**: Implement error handling based on Swagger examples

---

This comprehensive guide provides the foundation for building a modern, feature-rich LMS frontend that leverages all the capabilities of the sophisticated NestJS backend with enhanced file upload and materials management. Each page should be developed with attention to user experience, performance, and maintainability.
