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
import { CourseMap } from './CourseMap';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, FileText, ChevronLeft, MessageSquare, Map as MapIcon, LayoutGrid, BrainCircuit, BookOpen, PenTool, GraduationCap, TrendingUp, BookA, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuery } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { recentFilesService } from '../../lib/recentFiles';
import { usePageTitle } from '../../hooks/usePageTitle';

// --- Mobile Components ---

const MobileStudyHeader = ({ title, onBack, onChat }: { title: string, onBack: () => void, onChat: () => void }) => (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-b border-stone-200 z-[100] lg:hidden px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 min-w-0 flex-1">
            <button onClick={onBack} className="flex-shrink-0 p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full active:bg-stone-200 transition-colors">
                <ChevronLeft size={24} className="rtl:rotate-180" />
            </button>
            <h1 className="font-bold text-base text-stone-800 font-hand truncate">{title}</h1>
        </div>
        
        <button 
            onClick={onChat} 
            className="flex-shrink-0 flex items-center gap-2 pl-3 pr-2 py-1.5 -mr-2 text-school-board bg-school-board/5 hover:bg-school-board/10 border border-school-board/20 rounded-full active:bg-school-board/20 transition-all shadow-sm"
        >
            <span className="text-xs font-bold font-hand">المعلم AI</span>
            <div className="relative">
                <MessageSquare size={20} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                </span>
            </div>
        </button>
    </div>
);

const MobileStudyToolbar = ({ currentView, onViewChange, onTools }: { currentView: ViewMode, onViewChange: (v: ViewMode) => void, onTools: () => void }) => {
    const { t } = useTranslation();
    const NavButton = ({ view, icon: Icon, label, isActive }: { view: ViewMode, icon: any, label: string, isActive: boolean }) => (
        <button 
            onClick={() => onViewChange(view)}
            className={`flex flex-col items-center gap-1 transition-all group ${isActive ? 'text-school-board' : 'text-stone-400'}`}
        >
            <div className={`p-1.5 md:p-2 rounded-xl transition-all ${isActive ? 'bg-school-board/10' : 'bg-transparent group-hover:bg-stone-50'}`}>
                <Icon size={22} className="md:w-7 md:h-7" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] md:text-xs font-bold font-hand">{label}</span>
        </button>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe z-[100] lg:hidden px-4 md:px-8 py-2 md:py-3">
            <div className="flex items-center justify-between max-w-md md:max-w-2xl mx-auto w-full">
                {/* 1. Course Map */}
                <NavButton view="course_map" icon={MapIcon} label={t('course_map')} isActive={currentView === 'course_map'} />

                {/* 2. Summary (Swapped with Review) */}
                <NavButton view="summary" icon={BookOpen} label={t('deep_summary')} isActive={currentView === 'summary'} />

                {/* 3. Tools (Floating Center) */}
                <button 
                    onClick={onTools}
                    className="flex flex-col items-center gap-1 text-stone-400 active:text-stone-600 transition-colors -mt-8 md:-mt-10"
                >
                    <div className="p-3 md:p-4 bg-school-board text-white rounded-full shadow-lg border-4 border-stone-100 transform active:scale-95 transition-transform hover:bg-school-board/90">
                        <LayoutGrid size={24} className="md:w-8 md:h-8" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold font-hand translate-y-1">الأدوات</span>
                </button>

                {/* 4. Quiz */}
                <NavButton view="quiz" icon={GraduationCap} label={t('quizzes')} isActive={currentView === 'quiz'} />

                {/* 5. Review */}
                <NavButton view="review" icon={AlertTriangle} label={t('focus_review')} isActive={currentView === 'review'} />
            </div>
        </div>
    );
};

const ToolsSheet = ({ isOpen, onClose, currentView, onViewChange }: any) => {
    const { t } = useTranslation();
    
    // 1. AI Learning
    const aiTools = [
        { id: 'course_map', label: t('course_map'), icon: MapIcon, color: 'bg-indigo-100 text-indigo-600' },
        { id: 'summary', label: t('deep_summary'), icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
        { id: 'predictor', label: t('exam_predictor'), icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
        { id: 'glossary', label: t('live_glossary'), icon: BookA, color: 'bg-teal-100 text-teal-600' },
    ];

    // 2. Study Space
    const studyTools = [
        { id: 'flashcards', label: t('flashcards'), icon: BrainCircuit, color: 'bg-pink-100 text-pink-600' },
        { id: 'quiz', label: t('quizzes'), icon: GraduationCap, color: 'bg-green-100 text-green-600' },
    ];

    // 3. Notebooks
    const notebookTools = [
        { id: 'notebooks', label: t('my_notebook'), icon: FileText, color: 'bg-stone-100 text-stone-600' },
    ];

    const ToolButton = ({ tool }: any) => {
        const Icon = tool.icon;
        const isActive = currentView === tool.id;
        return (
            <button 
                onClick={() => { onViewChange(tool.id); onClose(); }}
                className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${isActive ? 'border-school-board bg-stone-50' : 'border-transparent hover:bg-stone-50'}`}
            >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.color}`}>
                    <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold font-hand text-stone-700 text-center leading-tight line-clamp-2">{tool.label}</span>
            </button>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[110] lg:hidden"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[120] lg:hidden p-6 pb-safe border-t border-stone-200 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6 flex-shrink-0" />
                        
                        <div className="space-y-6 pb-8">
                            {/* Section 1: AI Learning */}
                            <div>
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-1 font-hand">تعلم ذكي</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {aiTools.map(tool => <ToolButton key={tool.id} tool={tool} />)}
                                </div>
                            </div>

                            {/* Section 2: Study Space */}
                            <div>
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-1 font-hand">مساحة الدراسة</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {studyTools.map(tool => <ToolButton key={tool.id} tool={tool} />)}
                                </div>
                            </div>

                            {/* Section 3: Notebooks */}
                            <div>
                                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-1 font-hand">دفاتر</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {notebookTools.map(tool => <ToolButton key={tool.id} tool={tool} />)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export function StudyInterface() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const { currentView, setCurrentView, focusMode, setIsMobileChatOpen } = useOutletContext<{ 
    currentView: ViewMode; 
    setCurrentView: (view: ViewMode) => void;
    focusMode: boolean;
    setIsMobileChatOpen: (open: boolean) => void;
  }>();

  const [isToolsOpen, setIsToolsOpen] = useState(false);

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

  const rawFileName = resource?.name || "";
  const fileName = rawFileName ? rawFileName.replace(/\.[^/.]+$/, "") : ""; // Strip extension

  usePageTitle(fileName || t('study_space'));

  const onBack = () => {
      if (resource?.subjectId) {
          navigate(`/app/subject/${resource.subjectId}`);
      } else {
          navigate('/app');
      }
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'course_map':
        return <CourseMap />;
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
      backgroundImage: `repeating-linear-gradient(90deg, #d4c4a8, #d4c4a8 2px, #ccbc9f 4px, #d4c4a8 6px)`,
      backgroundColor: '#d4c4a8'
    }}></div>

      {/* --- MOBILE Header --- */}
      <MobileStudyHeader 
        title={fileName} 
        onBack={onBack} 
        onChat={() => setIsMobileChatOpen(true)} 
      />

      {/* Left Sidebar (Desktop: Static) */}
      <div className={`
        hidden lg:block w-1/4 min-w-[250px] max-w-[300px] relative z-20 h-full shadow-xl transition-all duration-300 
        ${focusMode ? 'ltr:-ml-[300px] rtl:-mr-[300px] opacity-0' : 'ml-0 rtl:mr-0 opacity-100'}
      `}>
        <StudySidebar currentView={currentView} onViewChange={setCurrentView} fileName={fileName} onBack={onBack} />
      </div>

      {/* Center Workspace (Dynamic) */}
      <div className="flex-1 relative z-10 overflow-hidden h-full flex flex-col pt-14 pb-20 lg:py-0">
        
        {/* Desktop Mobile Menu Button (Hidden in new mobile layout) */}
        {/* We removed the old top bar entirely for mobile, as we have the fixed header now */}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {renderContent()}
        </div>
      </div>

      {/* --- MOBILE Bottom Toolbar --- */}
      <MobileStudyToolbar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        onTools={() => setIsToolsOpen(true)}
      />

      {/* --- MOBILE Tools Sheet --- */}
      <ToolsSheet 
        isOpen={isToolsOpen} 
        onClose={() => setIsToolsOpen(false)} 
        currentView={currentView} 
        onViewChange={handleViewChange} 
      />

    </div>;
}