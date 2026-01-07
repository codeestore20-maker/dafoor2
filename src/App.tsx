import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LearningApp } from './pages/LearningApp';
import { Library } from './components/Library';
import { StudyInterface } from './components/StudyInterface';
import { useTranslation } from 'react-i18next';

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
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen bg-[#FFF8E7] text-stone-800 font-hand">
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/app" element={<LearningApp />}>
            <Route index element={<Library />} />
            <Route path="study/:fileId" element={<StudyInterface />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
