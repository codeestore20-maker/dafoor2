import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LearningApp } from './pages/LearningApp';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';

// Lazy load components for performance
const Library = lazy(() => import('./components/library/Library').then(module => ({ default: module.Library })));
const StudyInterface = lazy(() => import('./components/study/StudyInterface').then(module => ({ default: module.StudyInterface })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));

const Loading = () => (
  <div className="h-screen flex items-center justify-center bg-[#FFF8E7] font-hand text-xl">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-school-board border-t-transparent rounded-full animate-spin"></div>
      <span>Loading...</span>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#FFF8E7] font-hand text-xl">Loading...</div>;
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
        <div className="min-h-screen bg-[#FFF8E7] text-stone-800 font-hand">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/app" replace />} />
                  <Route path="/app" element={<LearningApp />}>
                      <Route index element={<Library />} />
                      <Route path="subject/:subjectId" element={<Library />} />
                      <Route path="study/:fileId" element={<StudyInterface />} />
                  </Route>
              </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}
