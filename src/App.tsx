import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LearningApp } from './pages/LearningApp';
import { Library } from './components/library/Library';
import { StudyInterface } from './components/study/StudyInterface';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';

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
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/app" replace />} />
                <Route path="/app" element={<LearningApp />}>
                    <Route index element={<Library />} />
                    <Route path="study/:fileId" element={<StudyInterface />} />
                </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
