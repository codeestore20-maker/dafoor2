import React, { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AITeacher } from '../components/study/AITeacher';
import { ChevronLeft, ChevronRight, Eye, EyeOff, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BrandSkeleton } from '../components/shared/BrandSkeleton';
import { useUIStore, ViewMode } from '../store/uiStore';

export function LearningApp() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isStudyMode = location.pathname.includes('/study');
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const {
    currentView,
    setCurrentView,
    focusMode,
    setFocusMode,
    isChatOpen,
    setIsChatOpen,
    isMobileChatOpen,
    setIsMobileChatOpen
  } = useUIStore();

  // Fix: Use a single useEffect to sync searchParams and Zustand state to prevent infinite loops
  useEffect(() => {
    if (!isStudyMode) return;
    
    const viewFromUrl = searchParams.get('view') as ViewMode;
    
    // If URL has a view that differs from state, update state
    if (viewFromUrl && viewFromUrl !== currentView) {
      setCurrentView(viewFromUrl);
    } 
    // If state has a view but URL doesn't (or it's different), update URL safely
    else if (currentView && viewFromUrl !== currentView) {
      // setSearchParams removed to fix loop
    }
  }, [searchParams, currentView, isStudyMode, setCurrentView, setSearchParams]);

  return (
    <div className="h-full w-full bg-stone-100 flex flex-col overflow-hidden font-sans text-stone-800 antialiased">
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 relative z-0 flex flex-col ${focusMode && isStudyMode ? 'w-full' : 'w-auto'}`}>
           
           {/* Focus Mode Toggle (Bottom Corner) */}
           {isStudyMode && (
             <button
               onClick={() => setFocusMode(!focusMode)}
               className={`absolute bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 p-3 text-white rounded-full shadow-2xl transition-all border-2 border-stone-800 hidden lg:flex items-center justify-center gap-2 group ${focusMode ? 'bg-red-500 hover:bg-red-600' : 'bg-school-board hover:bg-school-board/90'}`}
               title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
             >
               {focusMode ? <EyeOff size={20} /> : <Eye size={20} />}
               <span className="font-hand font-bold text-sm overflow-hidden w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pl-0 group-hover:pl-2 rtl:pl-0 rtl:group-hover:pr-2">
                 {focusMode ? 'خروج من التركيز' : 'وضع التركيز'}
               </span>
             </button>
           )}
           
           <div className="flex-1 overflow-hidden relative">
             <Suspense fallback={
               <div className="w-full h-full flex items-center justify-center bg-[#F5F5F0]">
                 <BrandSkeleton type="general" />
               </div>
             }>
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.3 }}
                 className="h-full w-full"
               >
                 <Outlet />
               </motion.div>
             </Suspense>
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
                  hidden lg:flex 
                  ${isChatOpen ? 'right-72 xl:right-80 rtl:right-auto rtl:left-72 rtl:xl:left-80' : 'right-0 rtl:right-auto rtl:left-0'}
                `}
                title={isChatOpen ? 'Close Chat' : 'Open Chat'}
              >
                {isChatOpen ? <ChevronRight size={20} className="flip-rtl" /> : <ChevronLeft size={20} className="flip-rtl" />}
              </button>
            )}

            {/* Desktop Chat Sidebar */}
            <div
            className={`
                hidden lg:block h-full relative z-10 shadow-xl bg-white transition-all duration-300
                ltr:border-l-2 ltr:border-stone-200
                rtl:border-r-2 rtl:border-stone-200
                ${(focusMode || !isChatOpen) ? 'w-0 overflow-hidden opacity-0' : 'w-80 opacity-100'}
            `}
            >
              <AITeacher currentView={currentView} />
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
                    className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 lg:hidden"
                  />
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-x-0 bottom-0 h-[85vh] bg-white z-50 lg:hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border-t-4 border-school-board"
                  >
                    {/* Smart Drawer Header */}
                    <div className="relative w-full flex items-center justify-center py-3 border-b border-stone-100/50">
                       {/* Drag Handle */}
                       <div 
                         className="w-16 h-1.5 bg-stone-300 rounded-full cursor-pointer hover:bg-stone-400 transition-colors"
                         onClick={() => setIsMobileChatOpen(false)}
                       ></div>

                       {/* Smart Close Button */}
                       <button 
                          onClick={() => setIsMobileChatOpen(false)} 
                          className="absolute right-4 rtl:left-4 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                       >
                          <X size={20} />
                       </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                       <AITeacher currentView={currentView} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
