# Component Architecture Guide

## Struktur Komponen Frontend LMS

### 1. Hierarki Komponen

```
App
├── AuthLayout
│   ├── LoginForm
│   ├── RegisterForm
│   └── ForgotPasswordForm
├── AppLayout
│   ├── Sidebar
│   ├── Header
│   ├── MainContent
│   │   ├── Dashboard
│   │   ├── LearningPath
│   │   │   ├── GradeSelector
│   │   │   ├── SubjectList
│   │   │   ├── ChapterList
│   │   │   └── SubchapterList
│   │   ├── ContentViewer
│   │   │   ├── AIContentDisplay
│   │   │   ├── AudioPlayer
│   │   │   └── ChatInterface
│   │   ├── QuizSystem
│   │   │   ├── QuizList
│   │   │   ├── QuizPlayer
│   │   │   └── QuizResults
│   │   ├── ProgressTracker
│   │   │   ├── ProgressChart
│   │   │   ├── AchievementBadges
│   │   │   └── LearningStats
│   │   └── AdminPanel (Admin only)
│   │       ├── UserManagement
│   │       ├── ContentManagement
│   │       └── Analytics
│   └── Footer
└── Modals/Dialogs
    ├── ConfirmDialog
    ├── ErrorDialog
    └── LoadingDialog
```

### 2. Komponen Utama

#### App Component
```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { LearningPath } from './pages/learning/LearningPath';
import { ContentViewer } from './pages/learning/ContentViewer';
import { QuizPage } from './pages/quiz/QuizPage';
import { ProgressPage } from './pages/progress/ProgressPage';
import { AdminPanel } from './pages/admin/AdminPanel';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            token ? <Navigate to="/dashboard" replace /> : 
            <AuthLayout><LoginPage /></AuthLayout>
          } />
          <Route path="/register" element={
            token ? <Navigate to="/dashboard" replace /> : 
            <AuthLayout><RegisterPage /></AuthLayout>
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="learning" element={<LearningPath />} />
            <Route path="learning/:subchapterId" element={<ContentViewer />} />
            <Route path="quiz/:subchapterId" element={<QuizPage />} />
            <Route path="progress" element={<ProgressPage />} />
            
            {/* Admin Only Routes */}
            <Route path="admin/*" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
```

#### AppLayout Component
```typescript
// src/components/layout/AppLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

#### Sidebar Component
```typescript
// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  Trophy, 
  BarChart3,
  Settings,
  Users,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['SISWA', 'ADMIN'] },
  { name: 'Pembelajaran', href: '/learning', icon: BookOpen, roles: ['SISWA'] },
  { name: 'Quiz', href: '/quiz', icon: Trophy, roles: ['SISWA'] },
  { name: 'Progress', href: '/progress', icon: BarChart3, roles: ['SISWA'] },
  { name: 'Admin Panel', href: '/admin', icon: Users, roles: ['ADMIN'] },
  { name: 'Pengaturan', href: '/settings', icon: Settings, roles: ['SISWA', 'ADMIN'] },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'SISWA')
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">LMS</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'ADMIN' ? 'Administrator' : 'Siswa'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-2">
              {filteredNavigation.map((item) => {
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
                    onClick={onClose}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
```

### 3. Feature Components

#### Learning Path Component
```typescript
// src/pages/learning/LearningPath.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Play, CheckCircle, Clock } from 'lucide-react';
import { useContentStore } from '../../stores/contentStore';
import { useProgressStore } from '../../stores/progressStore';

export function LearningPath() {
  const navigate = useNavigate();
  const { grades, fetchGrades, isLoading } = useContentStore();
  const { progress, fetchUserProgress } = useProgressStore();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  useEffect(() => {
    fetchGrades();
    fetchUserProgress();
  }, [fetchGrades, fetchUserProgress]);

  const getProgressStatus = (subchapterId: string) => {
    const userProgress = progress.find(p => p.subchapterId === subchapterId);
    return userProgress?.status || 'NOT_STARTED';
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jalur Pembelajaran</h1>
        <p className="text-muted-foreground">
          Pilih materi yang ingin Anda pelajari
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedGrade(null);
            setSelectedSubject(null);
            setSelectedChapter(null);
          }}
          className={!selectedGrade ? 'text-foreground font-medium' : ''}
        >
          Semua Kelas
        </Button>
        {selectedGrade && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSubject(null);
                setSelectedChapter(null);
              }}
              className={!selectedSubject ? 'text-foreground font-medium' : ''}
            >
              {grades.find(g => g.id === selectedGrade)?.title}
            </Button>
          </>
        )}
        {selectedSubject && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChapter(null)}
              className={!selectedChapter ? 'text-foreground font-medium' : ''}
            >
              {grades
                .find(g => g.id === selectedGrade)
                ?.subjects.find(s => s.id === selectedSubject)?.title}
            </Button>
          </>
        )}
        {selectedChapter && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">
              {grades
                .find(g => g.id === selectedGrade)
                ?.subjects.find(s => s.id === selectedSubject)
                ?.chapters.find(c => c.id === selectedChapter)?.title}
            </span>
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Show Grades */}
        {!selectedGrade && grades.map((grade) => (
          <Card 
            key={grade.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedGrade(grade.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {grade.title}
                <ChevronRight className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {grade.subjects.length} mata pelajaran
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Show Subjects */}
        {selectedGrade && !selectedSubject && 
          grades.find(g => g.id === selectedGrade)?.subjects.map((subject) => (
            <Card 
              key={subject.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSubject(subject.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {subject.title}
                  <ChevronRight className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {subject.chapters.length} bab
                </p>
              </CardContent>
            </Card>
          ))
        }

        {/* Show Chapters */}
        {selectedSubject && !selectedChapter &&
          grades
            .find(g => g.id === selectedGrade)
            ?.subjects.find(s => s.id === selectedSubject)
            ?.chapters.map((chapter) => (
              <Card 
                key={chapter.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedChapter(chapter.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {chapter.title}
                    <ChevronRight className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {chapter.subchapters.length} sub-bab
                  </p>
                </CardContent>
              </Card>
            ))
        }

        {/* Show Subchapters */}
        {selectedChapter &&
          grades
            .find(g => g.id === selectedGrade)
            ?.subjects.find(s => s.id === selectedSubject)
            ?.chapters.find(c => c.id === selectedChapter)
            ?.subchapters.map((subchapter) => {
              const status = getProgressStatus(subchapter.id);
              return (
                <Card 
                  key={subchapter.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/learning/${subchapter.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        {getProgressIcon(status)}
                        <span>{subchapter.title}</span>
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={status === 'COMPLETED' ? 'default' : 'secondary'}
                        className={status === 'COMPLETED' ? 'bg-green-500' : ''}
                      >
                        {status === 'COMPLETED' ? 'Selesai' : 
                         status === 'IN_PROGRESS' ? 'Sedang Belajar' : 'Belum Dimulai'}
                      </Badge>
                      <Button size="sm">
                        {status === 'NOT_STARTED' ? 'Mulai' : 'Lanjutkan'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        }
      </div>
    </div>
  );
}
```

#### Content Viewer Component
```typescript
// src/pages/learning/ContentViewer.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Volume2, MessageSquare, Trophy, ArrowLeft } from 'lucide-react';
import { useAiStore } from '../../stores/aiStore';
import { useContentStore } from '../../stores/contentStore';
import { ChatInterface } from '../../components/features/ChatInterface';
import { AudioPlayer } from '../../components/features/AudioPlayer';

export function ContentViewer() {
  const { subchapterId } = useParams<{ subchapterId: string }>();
  const navigate = useNavigate();
  const { content, fetchContent, isLoading } = useAiStore();
  const { currentSubchapter, setCurrentSubchapter } = useContentStore();

  useEffect(() => {
    if (subchapterId) {
      fetchContent(subchapterId);
      setCurrentSubchapter(subchapterId);
    }
  }, [subchapterId, fetchContent, setCurrentSubchapter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Memuat konten...</p>
        </div>
      </div>
    );
  }

  if (!content || !currentSubchapter) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Konten tidak ditemukan</p>
        <Button onClick={() => navigate('/learning')} className="mt-4">
          Kembali ke Pembelajaran
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/learning')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentSubchapter.title}</h1>
            <p className="text-sm text-muted-foreground">
              {currentSubchapter.chapter?.subject?.title} • {currentSubchapter.chapter?.subject?.grade?.title}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/quiz/${subchapterId}`)}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Quiz
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Materi</TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat AI
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Materi Pembelajaran
                    {content.audioUrl && (
                      <AudioPlayer audioUrl={content.audioUrl} />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {content.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chat">
              {subchapterId && <ChatInterface subchapterId={subchapterId} />}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Anda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Status</span>
                  <span className="font-medium text-green-600">Sedang Belajar</span>
                </div>
                <Button className="w-full">
                  Tandai Selesai
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/quiz/${subchapterId}`)}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Kerjakan Quiz
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {/* Open Unreal Engine session */}}
              >
                <Play className="h-4 w-4 mr-2" />
                Mode Metahuman
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### 4. Reusable Components

#### Audio Player Component
```typescript
// src/components/features/AudioPlayer.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
}

export function AudioPlayer({ audioUrl, autoPlay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    if (autoPlay) {
      audio.play();
      setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1 space-y-2">
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="w-20"
        />
      </div>
    </div>
  );
}
```

#### Loading Component
```typescript
// src/components/common/Loading.tsx
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-primary border-t-transparent',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
```

#### Error Boundary Component
```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Oops! Terjadi Kesalahan</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Aplikasi mengalami kesalahan yang tidak terduga. Silakan muat ulang halaman atau hubungi support.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left text-xs bg-muted p-2 rounded">
                  <summary>Detail Error (Development)</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <div className="flex space-x-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Muat Ulang
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Ke Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5. Custom Hooks

#### useLocalStorage Hook
```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
```

#### useDebounce Hook
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

Dokumentasi ini memberikan panduan lengkap untuk arsitektur komponen frontend LMS, termasuk struktur hierarki, implementasi komponen utama, komponen reusable, dan custom hooks yang diperlukan untuk membangun aplikasi yang scalable dan maintainable.