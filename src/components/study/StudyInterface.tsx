import React, { useState, useEffect } from 'react';
import { StudySidebar, ViewMode } from './StudySidebar';
import { SmartNotes } from './SmartNotes';
import { DeepSummary } from './DeepSummary';
import { ExamPredictor } from './ExamPredictor';
import { LiveGlossary } from './LiveGlossary';
import { Flashcards } from './Flashcards';
import { QuizMode } from './QuizMode';
import { SmartNotebooks } from './SmartNotebooks';
import { FocusReview } from './FocusReview';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuery } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { recentFilesService } from '../../lib/recentFiles';

export function StudyInterface() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const { currentView, setCurrentView, focusMode } = useOutletContext<{ 
    currentView: ViewMode; 
    setCurrentView: (view: ViewMode) => void;
    focusMode: boolean;
  }>();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: resource, isError: isResourceError } = useQuery({
    queryKey: ['resource', fileId],
    queryFn: () => resourceService.getOne(fileId!),
    enabled: !!fileId
  });

  // Add to recent files when resource is loaded
  useEffect(() => {
    if (resource && resource.id) {
      recentFilesService.addFile({
        id: resource.id,
        name: resource.name,
        subject: resource.subjectName || 'Subject',
        type: resource.type,
        size: resource.size
      });
    }
  }, [resource]);

  const rawFileName = resource?.name || t('loading_files');
  const fileName = rawFileName.replace(/\.[^/.]+$/, ""); // Strip extension

  const onBack = () => {
      if (resource?.subjectId) {
          navigate(`/app/subject/${resource.subjectId}`);
      } else {
          navigate('/app');
      }
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'notes':
        return <SmartNotes />;
      case 'summary':
        return <DeepSummary />;
      case 'predictor':
        return <ExamPredictor onPractice={() => setCurrentView('flashcards')} />;
      case 'glossary':
        return <LiveGlossary />;
      case 'flashcards':
        return <Flashcards />;
      case 'quiz':
        return <QuizMode />;
      case 'notebooks':
        return <SmartNotebooks />;
      case 'review':
        return <FocusReview />;
      default:
        return <DeepSummary />;
    }
  };

  return <div className="h-full flex flex-col md:flex-row bg-stone-100 relative overflow-hidden">
      {/* Desk Texture Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{
      backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
      backgroundColor: '#d4c4a8'
    }}></div>

      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 left-4 rtl:right-4 rtl:left-auto z-40">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-3 bg-school-board text-white rounded-full shadow-lg hover:bg-school-board/90 transition-all border-2 border-stone-800"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Left Sidebar (Desktop: Static, Mobile: Drawer) */}
      <div className={`
        hidden md:block w-1/4 min-w-[250px] max-w-[300px] relative z-20 h-full shadow-xl transition-all duration-300 
        ${focusMode ? 'ltr:-ml-[300px] rtl:-mr-[300px] opacity-0' : 'ml-0 rtl:mr-0 opacity-100'}
      `}>
        <StudySidebar currentView={currentView} onViewChange={setCurrentView} fileName={fileName} onBack={onBack} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-4/5 max-w-[300px] bg-stone-100 z-50 md:hidden shadow-2xl border-r rtl:border-l border-stone-300`}
            >
              <div className="h-full relative">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 text-stone-500 hover:text-red-500 z-50"
                >
                  <X size={24} />
                </button>
                <StudySidebar currentView={currentView} onViewChange={handleViewChange} fileName={fileName} onBack={onBack} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Center Workspace (Dynamic) */}
      <div className="flex-1 relative z-10 overflow-hidden h-full flex flex-col">
        {/* Mobile Title Bar */}
        <div className="md:hidden p-4 pb-2 flex items-center justify-center border-b border-stone-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
           <div className="flex items-center gap-2 text-school-board opacity-80">
              <FileText size={16} />
              <span className="font-hand font-bold text-sm truncate max-w-[200px]">{fileName}</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {renderContent()}
        </div>
      </div>
    </div>;
}