# LMS Frontend Development Guide

## Daftar Isi
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Setup](#project-setup)
4. [API Integration](#api-integration)
5. [Authentication System](#authentication-system)
6. [Feature Implementation](#feature-implementation)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [UI/UX Guidelines](#uiux-guidelines)
10. [Testing Strategy](#testing-strategy)
11. [Deployment](#deployment)

## Overview

LMS (Learning Management System) adalah aplikasi pembelajaran dengan integrasi AI ChatGPT dan dukungan Metahuman Unreal Engine. Frontend akan dibangun menggunakan modern React stack dengan TypeScript.

### Fitur Utama:
- **Autentikasi JWT** dengan role siswa dan admin
- **Struktur Pembelajaran** hierarkis (Grade → Subject → Chapter → Subchapter)
- **Interaksi AI** mirip ChatGPT untuk pembelajaran
- **Text-to-Speech** dengan ElevenLabs
- **Quiz Generator** otomatis menggunakan AI
- **Progress Tracking** siswa
- **Integrasi Unreal Engine** untuk Metahuman
- **WebSocket** untuk komunikasi real-time

## Tech Stack

### Core Technologies
```json
{
  "framework": "Vite + React 18",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "Zustand",
  "routing": "React Router v6",
  "http": "Axios",
  "forms": "React Hook Form + Zod",
  "websocket": "Socket.IO Client",
  "icons": "Lucide React",
  "animations": "Framer Motion",
  "charts": "Recharts"
}
```

### Development Tools
```json
{
  "bundler": "Vite",
  "testing": "Vitest + React Testing Library",
  "linting": "ESLint + Prettier",
  "types": "TypeScript",
  "git-hooks": "Husky + lint-staged"
}
```

## Project Setup

### 1. Initialize Project
```bash
npm create vite@latest lms-frontend -- --template react-ts
cd lms-frontend
npm install
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install react-router-dom axios zustand
npm install react-hook-form @hookform/resolvers zod
npm install socket.io-client
npm install lucide-react framer-motion recharts
npm install @radix-ui/react-toast @radix-ui/react-dialog
npm install class-variance-authority clsx tailwind-merge

# Development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D eslint-plugin-react-hooks @typescript-eslint/eslint-plugin
```

### 3. Setup shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card dialog toast
npx shadcn-ui@latest add form select textarea badge progress
npx shadcn-ui@latest add navigation-menu sidebar sheet
```

### 4. Project Structure
```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   ├── features/          # Feature-specific components
│   └── common/            # Reusable components
├── pages/
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── learning/          # Learning content pages
│   ├── quiz/              # Quiz pages
│   └── admin/             # Admin pages
├── stores/                # Zustand stores
├── services/              # API services
├── hooks/                 # Custom hooks
├── utils/                 # Utility functions
├── types/                 # TypeScript types
├── constants/             # App constants
└── assets/                # Static assets
```

## API Integration

### Base Configuration
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor untuk handle errors
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

### API Services

#### Authentication Service
```typescript
// src/services/authService.ts
import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'SISWA' | 'ADMIN';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'SISWA' | 'ADMIN';
    createdAt: string;
  };
  token: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};
```

#### Content Service
```typescript
// src/services/contentService.ts
import { api } from './api';

export interface Grade {
  id: string;
  title: string;
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  title: string;
  gradeId: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  subjectId: string;
  subchapters: Subchapter[];
  createdAt: string;
  updatedAt: string;
}

export interface Subchapter {
  id: string;
  title: string;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
}

export const contentService = {
  // Grades
  async getAllGrades(): Promise<Grade[]> {
    const response = await api.get('/content/grades');
    return response.data;
  },

  async getGradeById(id: string): Promise<Grade> {
    const response = await api.get(`/content/grades/${id}`);
    return response.data;
  },

  async createGrade(data: { title: string }): Promise<Grade> {
    const response = await api.post('/content/grades', data);
    return response.data;
  },

  // Subjects
  async getSubjectsByGrade(gradeId: string): Promise<Subject[]> {
    const response = await api.get(`/content/grades/${gradeId}/subjects`);
    return response.data;
  },

  async createSubject(data: { title: string; gradeId: string }): Promise<Subject> {
    const response = await api.post('/content/subjects', data);
    return response.data;
  },

  // Chapters
  async getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
    const response = await api.get(`/content/subjects/${subjectId}/chapters`);
    return response.data;
  },

  async createChapter(data: { title: string; subjectId: string }): Promise<Chapter> {
    const response = await api.post('/content/chapters', data);
    return response.data;
  },

  // Subchapters
  async getSubchaptersByChapter(chapterId: string): Promise<Subchapter[]> {
    const response = await api.get(`/content/chapters/${chapterId}/subchapters`);
    return response.data;
  },

  async getSubchapterById(id: string): Promise<Subchapter> {
    const response = await api.get(`/content/subchapters/${id}`);
    return response.data;
  },

  async createSubchapter(data: { title: string; chapterId: string }): Promise<Subchapter> {
    const response = await api.post('/content/subchapters', data);
    return response.data;
  },
};
```

#### AI Service
```typescript
// src/services/aiService.ts
import { api } from './api';

export interface AiGeneratedContent {
  id: string;
  subchapterId: string;
  content: string;
  audioUrl: string | null;
  isInitial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiChatLog {
  id: string;
  userId: string;
  subchapterId: string;
  message: string;
  messageType: 'USER' | 'AI';
  audioUrl: string | null;
  createdAt: string;
}

export const aiService = {
  async getSubchapterContent(subchapterId: string): Promise<AiGeneratedContent> {
    const response = await api.get(`/ai/subchapters/${subchapterId}/content`);
    return response.data;
  },

  async askQuestion(subchapterId: string, question: string): Promise<AiChatLog> {
    const response = await api.post(`/ai/subchapters/${subchapterId}/ask`, {
      question,
    });
    return response.data;
  },

  async getChatHistory(subchapterId: string): Promise<AiChatLog[]> {
    const response = await api.get(`/ai/subchapters/${subchapterId}/chat-history`);
    return response.data;
  },
};
```

#### Quiz Service
```typescript
// src/services/quizService.ts
import { api } from './api';

export interface Quiz {
  id: string;
  subchapterId: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface QuizResult {
  attempt: QuizAttempt;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  results: QuestionResult[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string>;
  score: number;
  completedAt: string;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export const quizService = {
  async getQuizBySubchapter(subchapterId: string): Promise<Quiz> {
    const response = await api.get(`/quiz/subchapters/${subchapterId}`);
    return response.data;
  },

  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<QuizResult> {
    const response = await api.post(`/quiz/${quizId}/submit`, { answers });
    return response.data;
  },

  async getUserQuizAttempts(subchapterId?: string): Promise<QuizAttempt[]> {
    const params = subchapterId ? { subchapterId } : {};
    const response = await api.get('/quiz/attempts', { params });
    return response.data;
  },
};
```

#### Progress Service
```typescript
// src/services/progressService.ts
import { api } from './api';

export interface UserProgress {
  id: string;
  userId: string;
  subchapterId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt: string | null;
  subchapter: {
    id: string;
    title: string;
    chapter: {
      title: string;
      subject: {
        title: string;
        grade: {
          title: string;
        };
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProgressSummary {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  completionPercentage: number;
}

export const progressService = {
  async getUserProgress(gradeId?: string): Promise<UserProgress[]> {
    const params = gradeId ? { gradeId } : {};
    const response = await api.get('/progress', { params });
    return response.data;
  },

  async getProgressSummary(): Promise<ProgressSummary> {
    const response = await api.get('/progress/summary');
    return response.data;
  },

  async getSubjectProgress(subjectId: string): Promise<any[]> {
    const response = await api.get(`/progress/subjects/${subjectId}`);
    return response.data;
  },
};
```

#### Unreal Service
```typescript
// src/services/unrealService.ts
import { api } from './api';

export interface MetahumanSessionData {
  subchapter: {
    id: string;
    title: string;
    subject: string;
    grade: string;
  };
  content: {
    text: string;
    audioUrl: string;
  };
  character: {
    name: string;
    expression: string;
    animation: string;
  };
  chatHistory: Array<{
    type: string;
    message: string;
    audioUrl: string;
    timestamp: string;
  }>;
  metadata: {
    sessionId: string;
    timestamp: string;
    duration: number;
  };
}

export const unrealService = {
  async getMetahumanSessionData(subchapterId: string): Promise<MetahumanSessionData> {
    const response = await api.get(`/unreal/sessions/${subchapterId}`);
    return response.data;
  },

  async updateSessionDuration(sessionId: string, duration: number): Promise<{ success: boolean }> {
    const response = await api.post(`/unreal/sessions/${sessionId}/duration`, {
      duration,
    });
    return response.data;
  },

  async getSessionHistory(subchapterId?: string): Promise<any[]> {
    const params = subchapterId ? { subchapterId } : {};
    const response = await api.get('/unreal/sessions', { params });
    return response.data;
  },
};
```

## Authentication System

### Auth Store
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type AuthResponse } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SISWA' | 'ADMIN';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role?: 'SISWA' | 'ADMIN' }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          localStorage.setItem('token', response.token);
          set({ 
            user: response.user, 
            token: response.token, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          localStorage.setItem('token', response.token);
          set({ 
            user: response.user, 
            token: response.token, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
```

### Protected Route Component
```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'SISWA' | 'ADMIN';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

## Feature Implementation

### 1. Dashboard Component
```typescript
// src/pages/dashboard/Dashboard.tsx
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/authStore';

export function Dashboard() {
  const { user } = useAuthStore();
  const { summary, fetchProgressSummary, isLoading } = useProgressStore();

  useEffect(() => {
    fetchProgressSummary();
  }, [fetchProgressSummary]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Selamat datang, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Mari lanjutkan perjalanan belajar Anda
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Belajar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.inProgress || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.completionPercentage || 0}%</div>
            <Progress value={summary?.completionPercentage || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 2. Learning Content Viewer
```typescript
// src/pages/learning/ContentViewer.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useAiStore } from '../../stores/aiStore';

export function ContentViewer() {
  const { subchapterId } = useParams<{ subchapterId: string }>();
  const { content, fetchContent, isLoading } = useAiStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (subchapterId) {
      fetchContent(subchapterId);
    }
  }, [subchapterId, fetchContent]);

  useEffect(() => {
    if (content?.audioUrl) {
      const audioElement = new Audio(content.audioUrl);
      audioElement.addEventListener('ended', () => setIsPlaying(false));
      setAudio(audioElement);
      
      return () => {
        audioElement.pause();
        audioElement.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [content?.audioUrl]);

  const toggleAudio = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  if (isLoading) {
    return <div>Loading content...</div>;
  }

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Materi Pembelajaran
            {content.audioUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <Volume2 className="h-4 w-4" />
                {isPlaying ? 'Pause' : 'Play'} Audio
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {content.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. AI Chat Interface
```typescript
// src/components/features/ChatInterface.tsx
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Volume2 } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

interface ChatInterfaceProps {
  subchapterId: string;
}

export function ChatInterface({ subchapterId }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, fetchChatHistory } = useChatStore();

  useEffect(() => {
    fetchChatHistory(subchapterId);
  }, [subchapterId, fetchChatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    await sendMessage(subchapterId, userMessage);
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat dengan AI Teacher</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.messageType === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.messageType === 'USER'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                {msg.audioUrl && msg.messageType === 'AI' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playAudio(msg.audioUrl!)}
                    className="mt-2 p-1 h-auto"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">AI sedang mengetik...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tanyakan sesuatu tentang materi ini..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 4. Quiz Component
```typescript
// src/pages/quiz/QuizPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useQuizStore } from '../../stores/quizStore';

export function QuizPage() {
  const { subchapterId } = useParams<{ subchapterId: string }>();
  const navigate = useNavigate();
  const { quiz, result, fetchQuiz, submitQuiz, isLoading } = useQuizStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    if (subchapterId) {
      fetchQuiz(subchapterId);
    }
  }, [subchapterId, fetchQuiz]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    try {
      await submitQuiz(quiz.id, answers);
      // Result akan ditampilkan setelah submit
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const nextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (isLoading) {
    return <div>Loading quiz...</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  // Show results if quiz is completed
  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hasil Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                {result.score}%
              </div>
              <p className="text-lg">
                Anda menjawab {result.correctAnswers} dari {result.totalQuestions} soal dengan benar
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(-1)}>
                  Kembali ke Materi
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Ulangi Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-4">
          {result.results.map((questionResult, index) => (
            <Card key={questionResult.questionId}>
              <CardHeader>
                <CardTitle className="text-lg">Soal {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{questionResult.question}</p>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Jawaban Anda:</span>{' '}
                    <span className={questionResult.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {questionResult.userAnswer}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Jawaban Benar:</span>{' '}
                    <span className="text-green-600">{questionResult.correctAnswer}</span>
                  </p>
                  {questionResult.explanation && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Penjelasan:</span> {questionResult.explanation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allAnswered = quiz.questions.every(q => answers[q.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {quiz.title}
            <span className="text-sm font-normal">
              {currentQuestion + 1} / {quiz.questions.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{question.question}</h3>
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Sebelumnya
              </Button>

              <div className="flex gap-2">
                {!isLastQuestion ? (
                  <Button onClick={nextQuestion}>
                    Selanjutnya
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isLoading}
                  >
                    {isLoading ? 'Mengirim...' : 'Selesai'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## State Management

### Content Store
```typescript
// src/stores/contentStore.ts
import { create } from 'zustand';
import { contentService, type Grade, type Subject, type Chapter, type Subchapter } from '../services/contentService';

interface ContentState {
  grades: Grade[];
  currentGrade: Grade | null;
  currentSubject: Subject | null;
  currentChapter: Chapter | null;
  currentSubchapter: Subchapter | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGrades: () => Promise<void>;
  setCurrentGrade: (gradeId: string) => Promise<void>;
  setCurrentSubject: (subjectId: string) => void;
  setCurrentChapter: (chapterId: string) => void;
  setCurrentSubchapter: (subchapterId: string) => Promise<void>;
  clearError: () => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  grades: [],
  currentGrade: null,
  currentSubject: null,
  currentChapter: null,
  currentSubchapter: null,
  isLoading: false,
  error: null,

  fetchGrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const grades = await contentService.getAllGrades();
      set({ grades, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch grades', 
        isLoading: false 
      });
    }
  },

  setCurrentGrade: async (gradeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const grade = await contentService.getGradeById(gradeId);
      set({ currentGrade: grade, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch grade', 
        isLoading: false 
      });
    }
  },

  setCurrentSubject: (subjectId: string) => {
    const { currentGrade } = get();
    if (currentGrade) {
      const subject = currentGrade.subjects.find(s => s.id === subjectId);
      set({ currentSubject: subject || null });
    }
  },

  setCurrentChapter: (chapterId: string) => {
    const { currentSubject } = get();
    if (currentSubject) {
      const chapter = currentSubject.chapters.find(c => c.id === chapterId);
      set({ currentChapter: chapter || null });
    }
  },

  setCurrentSubchapter: async (subchapterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const subchapter = await contentService.getSubchapterById(subchapterId);
      set({ currentSubchapter: subchapter, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch subchapter', 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### AI Store
```typescript
// src/stores/aiStore.ts
import { create } from 'zustand';
import { aiService, type AiGeneratedContent } from '../services/aiService';

interface AiState {
  content: AiGeneratedContent | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchContent: (subchapterId: string) => Promise<void>;
  clearContent: () => void;
  clearError: () => void;
}

export const useAiStore = create<AiState>((set) => ({
  content: null,
  isLoading: false,
  error: null,

  fetchContent: async (subchapterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const content = await aiService.getSubchapterContent(subchapterId);
      set({ content, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch content', 
        isLoading: false 
      });
    }
  },

  clearContent: () => set({ content: null }),
  clearError: () => set({ error: null }),
}));
```

### Chat Store
```typescript
// src/stores/chatStore.ts
import { create } from 'zustand';
import { aiService, type AiChatLog } from '../services/aiService';

interface ChatState {
  messages: AiChatLog[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchChatHistory: (subchapterId: string) => Promise<void>;
  sendMessage: (subchapterId: string, message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchChatHistory: async (subchapterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await aiService.getChatHistory(subchapterId);
      set({ messages, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch chat history', 
        isLoading: false 
      });
    }
  },

  sendMessage: async (subchapterId: string, message: string) => {
    const { messages } = get();
    
    // Add user message immediately
    const userMessage: AiChatLog = {
      id: `temp-${Date.now()}`,
      userId: 'current-user',
      subchapterId,
      message,
      messageType: 'USER',
      audioUrl: null,
      createdAt: new Date().toISOString(),
    };
    
    set({ messages: [...messages, userMessage], isLoading: true, error: null });

    try {
      const aiResponse = await aiService.askQuestion(subchapterId, message);
      set({ 
        messages: [...messages, userMessage, aiResponse], 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to send message', 
        isLoading: false 
      });
    }
  },

  clearMessages: () => set({ messages: [] }),
  clearError: () => set({ error: null }),
}));
```

## UI/UX Guidelines

### Design System
```typescript
// src/lib/design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      900: '#111827',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
};
```

### Layout Components
```typescript
// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
```

### Responsive Navigation
```typescript
// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  Trophy, 
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pembelajaran', href: '/learning', icon: BookOpen },
  { name: 'Chat AI', href: '/chat', icon: MessageSquare },
  { name: 'Quiz', href: '/quiz', icon: Trophy },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <h1 className="text-xl font-bold">LMS</h1>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
```

## Testing Strategy

### Test Setup
```typescript
// src/test/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Component Tests
```typescript
// src/components/auth/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { LoginForm } from './LoginForm';

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('LoginForm', () => {
  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockLogin = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

### API Service Tests
```typescript
// src/services/authService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { api } from './api';

vi.mock('./api');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'SISWA',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
          token: 'mock-token',
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login error', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
        },
      };

      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toEqual(mockError);
    });
  });
});
```

## Deployment

### Environment Configuration
```typescript
// src/config/env.ts
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
```

### Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
});
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://backend:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## Kesimpulan

Dokumentasi ini memberikan panduan lengkap untuk mengembangkan frontend LMS yang terintegrasi dengan backend NestJS. Dengan mengikuti struktur dan pola yang dijelaskan, developer dapat membangun aplikasi yang:

1. **Scalable**: Arsitektur modular dengan state management yang terorganisir
2. **Maintainable**: Kode yang bersih dengan TypeScript dan testing
3. **User-friendly**: UI/UX modern dengan shadcn/ui dan responsive design
4. **Production-ready**: Konfigurasi deployment dan optimasi performa

Setiap endpoint backend telah dipetakan ke service dan store yang sesuai, memungkinkan integrasi yang seamless antara frontend dan backend.