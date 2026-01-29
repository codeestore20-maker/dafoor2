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
import { Menu, X, FileText, ChevronLeft, MessageSquare, Map as MapIcon, LayoutGrid, BrainCircuit, BookOpen, PenTool, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuery } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { recentFilesService } from '../../lib/recentFiles';

// --- Mobile Components ---

const MobileStudyHeader = ({ title, onBack, onChat }: { title: string, onBack: () => void, onChat: () => void }) => (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-b border-stone-200 z-[100] lg:hidden px-4 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full active:bg-stone-200 transition-colors">
            <ChevronLeft size={24} className="rtl:rotate-180" />
        </button>
        
        <h1 className="font-bold text-base text-stone-800 font-hand truncate max-w-[200px]">{title}</h1>
        
        <button onClick={onChat} className="p-2 -mr-2 text-school-board hover:bg-stone-100 rounded-full active:bg-stone-200 transition-colors">
            <MessageSquare size={22} />
        </button>
    </div>
);

const MobileStudyToolbar = ({ currentView, onViewChange, onTools }: { currentView: ViewMode, onViewChange: (v: ViewMode) => void, onTools: () => void }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe z-[100] lg:hidden px-6 py-2">
            <div className="flex items-center justify-between max-w-sm mx-auto">
                <button 
                    onClick={() => onViewChange('course_map')}
                    className={`flex flex-col items-center gap-1 transition-all ${currentView === 'course_map' ? 'text-school-board' : 'text-stone-400'}`}
                >
                    <div className={`p-1.5 rounded-xl ${currentView === 'course_map' ? 'bg-school-board/10' : 'bg-transparent'}`}>
                        <MapIcon size={24} strokeWidth={currentView === 'course_map' ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-bold font-hand">الخريطة</span>
                </button>

                <button 
                    onClick={onTools}
                    className="flex flex-col items-center gap-1 text-stone-400 active:text-stone-600 transition-colors"
                >
                    <div className="p-3 -mt-6 bg-school-board text-white rounded-full shadow-lg border-4 border-stone-100">
                        <LayoutGrid size={24} />
                    </div>
                    <span className="text-[10px] font-bold font-hand">الأدوات</span>
                </button>

                <button 
                    onClick={() => onViewChange('summary')}
                    className={`flex flex-col items-center gap-1 transition-all ${currentView === 'summary' ? 'text-school-board' : 'text-stone-400'}`}
                >
                    <div className={`p-1.5 rounded-xl ${currentView === 'summary' ? 'bg-school-board/10' : 'bg-transparent'}`}>
                        <BookOpen size={24} strokeWidth={currentView === 'summary' ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-bold font-hand">الملخص</span>
                </button>
            </div>
        </div>
    );
};

const ToolsSheet = ({ isOpen, onClose, currentView, onViewChange }: any) => {
    const tools = [
        { id: 'summary', label: 'ملخص عميق', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
        { id: 'notes', label: 'ملاحظات ذكية', icon: PenTool, color: 'bg-amber-100 text-amber-600' },
        { id: 'flashcards', label: 'بطاقات', icon: BrainCircuit, color: 'bg-pink-100 text-pink-600' },
        { id: 'quiz', label: 'اختبارات', icon: GraduationCap, color: 'bg-green-100 text-green-600' },
        { id: 'notebooks', label: 'دفاتري', icon: FileText, color: 'bg-stone-100 text-stone-600' },
    ];

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
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[120] lg:hidden p-6 pb-safe border-t border-stone-200 shadow-2xl"
                    >
                        <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6" />
                        <h3 className="text-lg font-bold font-hand text-stone-800 mb-4 text-center">أدوات الدراسة</h3>
                        
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {tools.map((tool) => {
                                const Icon = tool.icon;
                                const isActive = currentView === tool.id;
                                return (
                                    <button 
                                        key={tool.id}
                                        onClick={() => { onViewChange(tool.id); onClose(); }}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${isActive ? 'border-school-board bg-stone-50' : 'border-transparent hover:bg-stone-50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-xs font-bold font-hand text-stone-700">{tool.label}</span>
                                    </button>
                                );
                            })}
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