import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ViewMode } from '../components/study/StudySidebar';
import { AITeacher } from '../components/study/AITeacher';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Eye, EyeOff, Menu, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function LearningApp() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isStudyMode = location.pathname.includes('/study');
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // Lifted state for StudyInterface
  // Sync currentView with URL query param 'view'
  const currentView = (isStudyMode ? (searchParams.get('view') as ViewMode) : 'summary') || 'summary';
  
  const setCurrentView = (view: ViewMode) => {
    if (isStudyMode) {
      setSearchParams(prev => {
        prev.set('view', view);
        return prev;
      });
    }
  };

  const [focusMode, setFocusMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false); // Mobile chat state

  const handleBackToLibrary = () => {
    navigate('/');
    // Reset view when going back - not needed with URL sync, but good practice
    setFocusMode(false);
    setIsChatOpen(true);
  };

  return <div className="h-screen w-full bg-stone-100 flex flex-col overflow-hidden font-sans text-stone-800 antialiased">
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 relative z-0 flex flex-col ${focusMode && isStudyMode ? 'w-full' : 'w-auto'}`}>
           
           {/* Mobile Header removed */}

           {/* Focus Mode Toggle (Top Right of Content) */}
           {isStudyMode && (
             <button
               onClick={() => setFocusMode(!focusMode)}
               className={`absolute top-4 right-4 rtl:right-auto rtl:left-4 z-40 p-2 text-white rounded-full shadow-lg transition-all border-2 border-stone-800 hidden md:block ${focusMode ? 'bg-red-500 hover:bg-red-600' : 'bg-school-board hover:bg-school-board/90'}`}
               title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
             >
               {focusMode ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
           )}
           
           <div className="flex-1 overflow-hidden relative">
             <Outlet context={{ currentView, setCurrentView, focusMode, isSidebarOpen, setIsSidebarOpen }} />
           </div>
        </div>

        {/* Right Sidebar: AI Teacher (Only in Study Mode) */}
        {isStudyMode && (
          <>
            {/* Chat Toggle Tab (Desktop) */}
            {!focusMode && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`
                  absolute top-1/2 -translate-y-1/2 z-20 w-8 h-16 flex items-center justify-center 
                  bg-school-board text-white shadow-md border-t-2 border-b-2 border-stone-800
                  ltr:border-l-2 ltr:rounded-l-lg
                  rtl:border-r-2 rtl:rounded-r-lg
                  hover:bg-school-board/90 transition-all duration-300
                  hidden xl:flex 
                  ${isChatOpen ? 'right-80 rtl:right-auto rtl:left-80' : 'right-0 rtl:right-auto rtl:left-0'}
                `}
                title={isChatOpen ? 'Close Chat' : 'Open Chat'}
              >
                {isChatOpen ? <ChevronRight size={20} className="flip-rtl" /> : <ChevronLeft size={20} className="flip-rtl" />}
              </button>
            )}

            {/* Desktop Chat Sidebar */}
            <div
            className={`
                hidden xl:block h-full relative z-10 shadow-xl bg-white transition-all duration-300
                ltr:border-l-2 ltr:border-stone-200
                rtl:border-r-2 rtl:border-stone-200
                ${(focusMode || !isChatOpen) ? 'w-0 overflow-hidden opacity-0' : 'w-80 opacity-100'}
            `}
            >
              <AITeacher currentView={currentView} />
            </div>

            {/* Mobile Chat FAB */}
            <div className="xl:hidden fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-50">
               <button
                 onClick={() => setIsMobileChatOpen(true)}
                 className="w-14 h-14 bg-school-board text-white rounded-full shadow-xl flex items-center justify-center border-2 border-stone-800 hover:scale-110 transition-transform"
               >
                 <MessageSquare size={24} />
               </button>
            </div>

            {/* Mobile Chat Drawer */}
            <AnimatePresence>
              {isMobileChatOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileChatOpen(false)}
                    className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 xl:hidden"
                  />
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-x-0 bottom-0 h-[85vh] bg-white z-50 xl:hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border-t-4 border-school-board"
                  >
                    {/* Handle Bar */}
                    <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsMobileChatOpen(false)}>
                       <div className="w-16 h-1.5 bg-stone-300 rounded-full"></div>
                    </div>
                    
                    {/* Header */}
                    <div className="px-6 py-2 flex items-center justify-between border-b border-stone-100">
                       <h3 className="font-hand font-bold text-xl text-stone-800">AI Teacher</h3>
                       <button onClick={() => setIsMobileChatOpen(false)} className="p-2 text-stone-400 hover:text-red-500">
                         <X size={24} />
                       </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <AITeacher currentView={currentView} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>;
}
