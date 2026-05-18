import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LearningApp } from './pages/LearningApp';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { BrandSkeleton } from './components/shared/BrandSkeleton';
import { TopLoader } from './components/shared/TopLoader';

// Lazy load components for performance
const Library = lazy(() => import('./components/library/Library').then(module => ({ default: module.Library })));
const StudyInterface = lazy(() => import('./components/study/StudyInterface').then(module => ({ default: module.StudyInterface })));
const CourseMap = lazy(() => import('./components/study/CourseMap').then(module => ({ default: module.CourseMap })));
const SmartLessonPlayer = lazy(() => import('./components/study/SmartLessonPlayer').then(module => ({ default: module.SmartLessonPlayer })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));

const Loading = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#FFF8E7]">
    <div className="max-w-md w-full">
       <BrandSkeleton type="general" className="border-none bg-transparent shadow-none" />
    </div>
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Dynamically update document direction and language based on current language
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Toggle RTL class on body for specific styling overrides
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="h-[100dvh] bg-[#FFF8E7] text-stone-800 font-hand overflow-hidden flex flex-col">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                  {/* <Route path="/" element={<Navigate to="/app" replace />} /> Removed in favor of Landing Page */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/app" element={<LearningApp />}>
                      <Route index element={<Library />} />
                      <Route path="subject/:subjectId" element={<Library />} />
                      <Route path="study/:fileId" element={<StudyInterface />} />
                      <Route path="course-map/:fileId" element={<CourseMap />} />
                      <Route path="lesson/:topicId" element={<SmartLessonPlayer />} />
                  </Route>
              </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}
