import React from 'react';
import { motion } from 'framer-motion';
import { NotebookPaper } from '../shared/NotebookPaper';
import { HandUnderline } from '../shared/Doodles';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import ReactMarkdown from 'react-markdown';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DeepSummary() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [activeChapterIndex, setActiveChapterIndex] = React.useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [showFloatingBtn, setShowFloatingBtn] = React.useState(true); // New state for smart button
  const isRTL = document.dir === 'rtl';

  const { data: summary, isLoading, isError, error } = useQuery({
    queryKey: ['summary', fileId],
    queryFn: () => resourceService.getSummary(fileId!),
    enabled: !!fileId,
    retry: false
  });

  const generateMutation = useMutation({
    mutationFn: () => resourceService.generateSummary(fileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary', fileId] });
    }
  });

  // Reset chapter index when file changes
  React.useEffect(() => {
    setActiveChapterIndex(0);
  }, [fileId]);

  // Debug: Log incoming summary data
  React.useEffect(() => {
    if (summary) {
        console.log("Summary Data Received:", summary);
        console.log("Chapters:", summary.chapters);
    }
  }, [summary]);

  // Handle scroll to toggle button visibility (Smart Scroll)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 768) return; 
    
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Show button if scrolling UP or at the very top
    if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowFloatingBtn(true);
    } 
    // Hide button if scrolling DOWN and not at top
    else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowFloatingBtn(false);
    }

    setLastScrollY(currentScrollY);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
         <div className="animate-spin mb-4">
            <RefreshCw size={32} />
         </div>
         <p className="font-hand text-xl">{t('loading_summary')}</p>
      </div>
    );
  }

  // If error is 404 (not found), show Generate UI
  if (isError || !summary) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="bg-school-board/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-school-board">
            <Sparkles size={40} />
          </div>
          <h2 className="font-hand text-3xl font-bold text-stone-800 mb-4">
            {t('deep_summary_empty')}
          </h2>
          <p className="font-hand text-stone-600 mb-8">
            {t('ai_not_analyzed')}
          </p>
          
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-8 py-3 bg-school-board text-white rounded-xl font-hand font-bold text-xl shadow-[4px_4px_0px_rgba(41,37,36,1)] border-2 border-stone-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                {t('generate_summary')}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const hasChapters = summary.chapters && Array.isArray(summary.chapters) && summary.chapters.length > 0;
  const activeContent = hasChapters ? summary.chapters[activeChapterIndex].content : summary.content;

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden relative">
      {/* --- Mobile TOC Implementation --- */}
      {hasChapters && (
        <>
           {/* Floating Toggle Button (Bottom Corner - Text Only) */}
           <div className={`
             md:hidden fixed bottom-6 z-50
             transition-all duration-300 ease-in-out
             ${isRTL ? 'right-6' : 'left-6'}
             ${isMobileMenuOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}
             ${showFloatingBtn ? 'translate-y-0' : 'translate-y-20'} 
           `}>
             <button
               onClick={() => setIsMobileMenuOpen(true)}
               className="bg-school-board text-white px-4 py-2 rounded-xl shadow-lg font-hand font-bold text-sm border border-white/20 active:scale-95 transition-transform"
             >
                {t('table_of_contents')}
             </button>
           </div>

           {/* Top Dropdown Drawer */}
           <div className={`
             md:hidden fixed top-0 left-0 right-0 z-50 
             bg-[#fdfbf7] border-b-4 border-school-board shadow-xl
             transition-transform duration-300 ease-out
             ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}
             max-h-[60vh] flex flex-col
           `}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
                 <h3 className="font-hand font-bold text-stone-600 text-sm uppercase tracking-wider flex items-center gap-2">
                   <Sparkles size={16} className="text-school-board" />
                   {t('table_of_contents')}
                 </h3>
                 <button 
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="p-2 bg-stone-200 rounded-full hover:bg-stone-300 text-stone-600 transition-colors"
                 >
                   <AlertCircle size={20} className="-rotate-90" />
                 </button>
              </div>

              {/* List */}
              <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {summary.chapters.map((chap: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                       setActiveChapterIndex(idx);
                       setIsMobileMenuOpen(false);
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-lg font-hand text-sm transition-all flex items-center gap-3
                      ${activeChapterIndex === idx 
                        ? 'bg-school-board/10 text-school-board font-bold ring-1 ring-school-board/20' 
                        : 'bg-white border border-stone-200 text-stone-600 active:bg-stone-50'
                      }
                    `}
                  >
                     <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeChapterIndex === idx ? 'bg-school-board text-white' : 'bg-stone-200 text-stone-500'}`}>
                       {idx + 1}
                     </span>
                     <span className="line-clamp-1">{chap.title}</span>
                  </button>
                ))}
              </div>
              
              {/* Drag Handle Visual */}
              <div className="h-1.5 w-12 bg-stone-300 rounded-full mx-auto my-2 opacity-50"></div>
           </div>

           {/* Backdrop */}
           {isMobileMenuOpen && (
             <div 
               className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
               onClick={() => setIsMobileMenuOpen(false)}
             />
           )}
        </>
      )}

      {/* Chapter Sidebar (Desktop Only) */}
      {hasChapters && (
        <div className={`
          hidden md:flex flex-col flex-shrink-0 h-full
          w-56 lg:w-72 xl:w-80
          bg-[#fdfbf7]/50 backdrop-blur-sm
          border-r border-stone-200/50
          ${isRTL ? 'md:order-last border-l border-r-0' : 'md:order-first'}
        `}>
           <div className="flex-shrink-0 p-6 pb-2">
             <h3 className="font-hand font-bold text-stone-400 text-xs uppercase tracking-wider border-b border-stone-200 pb-2">
               {t('table_of_contents')}
             </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-4 pb-4 space-y-3">
             {summary.chapters.map((chap: any, idx: number) => (
               <button
                 key={idx}
                 onClick={() => setActiveChapterIndex(idx)}
                 className={`w-full text-left p-3 rounded-lg font-hand text-sm transition-all relative group
                   ${activeChapterIndex === idx 
                     ? 'bg-[#fff9c4] text-stone-800 shadow-md -rotate-1 scale-[1.02] z-10 ring-1 ring-stone-300' 
                     : 'bg-white text-stone-600 hover:bg-stone-50 hover:shadow-sm hover:-rotate-1'
                   }
                   before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-black/5 before:rounded-t-lg
                 `}
               >
                 <div className="absolute top-1/2 -left-1 w-2 h-2 bg-stone-100 rounded-full shadow-inner transform -translate-y-1/2"></div>
                 <div className="flex items-start gap-3 pl-2">
                    <span className={`font-bold text-lg leading-none opacity-40 ${activeChapterIndex === idx ? 'text-school-board' : ''}`}>
                      {idx + 1}
                    </span>
                    <span className="leading-tight font-bold line-clamp-2 pt-0.5">{chap.title}</span>
                 </div>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 custom-scrollbar"
        onScroll={handleScroll}
      >
        <motion.div
          key={activeChapterIndex} // Trigger animation on chapter change
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <NotebookPaper title={hasChapters ? summary.chapters[activeChapterIndex].title : t('deep_summary')} className="max-w-4xl mx-auto">
            <article className="text-stone-800 leading-relaxed prose prose-stone max-w-none">
              {/* Header Metadata */}
              <div className="mb-8 not-prose border-b-2 border-dashed border-stone-300 pb-4">
                 <div className="flex items-center gap-2 text-sm text-stone-500 italic">
                  <span>{t('ai_generated')}</span>
                  <span>•</span>
                  <span>{t('min_read', { count: Math.ceil((activeContent.length || 0) / 1000) })}</span>
                  <span>•</span>
                  <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Markdown Content */}
              <ReactMarkdown
                components={{
                  p: ({node, ...props}) => <p className="font-hand mb-4 break-words" {...props} />,
                  h1: ({node, ...props}) => <h1 className="font-hand text-3xl md:text-4xl font-bold text-school-board mb-6 mt-4 break-words" {...props} />,
                  h2: ({node, ...props}) => (
                    <h2 className="font-hand text-2xl font-bold text-school-blue mb-4 mt-8 flex flex-wrap items-center gap-2 break-words" {...props}>
                      {props.children}
                      <HandUnderline className="w-16 h-2 text-school-blue opacity-30 inline-block ml-2 flex-shrink-0" />
                    </h2>
                  ),
                  h3: ({node, ...props}) => <h3 className="font-hand text-xl font-bold text-stone-700 mb-3 mt-6 break-words" {...props} />,
                  ul: ({node, ...props}) => <ul className="font-hand list-disc pl-6 space-y-2 marker:text-school-red mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="font-hand pl-1 break-words" {...props} />,
                  strong: ({node, ...props}) => <span className="font-hand font-bold bg-yellow-100/80 px-1 rounded mx-0.5 box-decoration-clone" {...props} />,
                  code: ({node, ...props}) => <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-sm text-pink-600 break-all whitespace-pre-wrap" {...props} />,
                  pre: ({node, ...props}) => (
                    <div className="bg-stone-800 p-4 rounded-lg my-6 overflow-x-auto custom-scrollbar">
                       <pre className="font-mono text-sm text-stone-200" {...props} />
                    </div>
                  ),
                  blockquote: ({node, ...props}) => (
                    <div className="bg-stone-100 p-4 md:p-6 rounded-lg border-l-4 border-school-pencil my-6">
                      <div className="italic text-stone-700 m-0 break-words whitespace-pre-wrap">{props.children}</div>
                    </div>
                  ),
                }}
              >
                {activeContent}
              </ReactMarkdown>

            </article>
          </NotebookPaper>
        </motion.div>
      </div>
    </div>
  );
}