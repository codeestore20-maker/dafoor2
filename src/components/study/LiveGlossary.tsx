import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Sparkles, RefreshCw, BookA, Eye, EyeOff, Highlighter } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { NotebookPaper } from '../shared/NotebookPaper';
import { useTranslation } from 'react-i18next';

export function LiveGlossary() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [highlightedTerms, setHighlightedTerms] = useState<Set<string>>(new Set());

  const toggleHighlight = (termId: string) => {
    const newSet = new Set(highlightedTerms);
    if (newSet.has(termId)) {
      newSet.delete(termId);
    } else {
      newSet.add(termId);
    }
    setHighlightedTerms(newSet);
  };

  const { data: terms, isLoading, isError } = useQuery({
    queryKey: ['glossary', fileId],
    queryFn: () => resourceService.getGlossary(fileId!),
    enabled: !!fileId,
    retry: false
  });

  const generateMutation = useMutation({
    mutationFn: () => resourceService.generateGlossary(fileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary', fileId] });
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
         <div className="animate-spin mb-4">
            <RefreshCw size={32} />
         </div>
         <p className="font-hand text-xl">{t('compiling_glossary')}</p>
      </div>
    );
  }

  if (isError || !terms || !terms.length) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="bg-school-board/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-school-board">
              <BookA size={40} />
            </div>
            <h2 className="font-hand text-3xl font-bold text-stone-800 mb-4">
              {t('live_glossary')}
            </h2>
            <p className="font-hand text-stone-600 mb-8">
              {t('glossary_description')}
            </p>
            
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="px-8 py-3 bg-school-board text-white rounded-xl font-hand font-bold text-xl shadow-[4px_4px_0px_rgba(41,37,36,1)] border-2 border-stone-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {generateMutation.isPending ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  {t('building')}
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  {t('build_glossary')}
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

  const filteredTerms = terms ? terms.filter((term: any) => 
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Group terms by first letter
  const groupedTerms = filteredTerms.reduce((acc: any, term: any) => {
    const firstLetter = term.term.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(term);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groupedTerms).sort();

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
       <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
        <NotebookPaper title={t('live_glossary')} className="max-w-5xl mx-auto relative min-h-[800px]">
          
          {/* Header Controls */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 sticky top-0 z-20 bg-[#fdfbf6]/95 backdrop-blur-sm py-2 border-b-2 border-stone-200">
             <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                 <input 
                   type="text" 
                   placeholder={t('search_placeholder')}
                   value={searchTerm} 
                   onChange={e => setSearchTerm(e.target.value)} 
                   className="w-full pl-3 pr-8 rtl:pl-8 rtl:pr-3 py-1.5 bg-white border-2 border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-board/20 font-hand text-lg shadow-[2px_2px_0px_rgba(41,37,36,1)]" 
                 />
                 <Search className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 text-stone-800" size={16} />
               </div>
             </div>

             <div className="flex items-center gap-3 justify-end">
               <button 
                 onClick={() => setStudyMode(!studyMode)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-hand text-sm transition-all shadow-[2px_2px_0px_rgba(41,37,36,1)] active:translate-y-[2px] active:shadow-none ${studyMode ? 'bg-school-board text-white border-stone-800' : 'bg-white text-stone-800 border-stone-800 hover:bg-stone-50'}`}
               >
                 {studyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                 {studyMode ? t('study_mode_on') : t('study_mode_off')}
               </button>
             </div>
          </div>

          <div className="flex relative">
            {/* Main Content */}
            <div className="flex-1 pr-0 md:pr-12 rtl:pr-0 rtl:pl-0 rtl:md:pl-12">
              <div className="space-y-12">
                {sortedKeys.map(letter => (
                  <div key={letter} id={`letter-${letter}`} className="relative scroll-mt-32">
                    {/* Letter Divider */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="font-hand font-bold text-3xl text-school-board border-b-4 border-school-board/20 px-2">
                        {letter}
                      </div>
                      <div className="h-0.5 flex-1 bg-stone-200 border-t border-dashed border-stone-300"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {groupedTerms[letter].map((term: any) => (
                        <div key={term.id} className="group relative h-full">
                          <div className={`rounded-xl border-2 transition-all h-full flex flex-col relative overflow-hidden group ${highlightedTerms.has(term.id) ? 'bg-yellow-50 border-yellow-400 shadow-md' : 'bg-white border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300'}`}>
                            {/* Header Section - Green/Colored Top */}
                            <div className={`px-4 py-3 border-b-2 border-dashed ${highlightedTerms.has(term.id) ? 'bg-yellow-100 border-yellow-300' : 'bg-[#e8f5e9] border-stone-200'} flex justify-between items-start gap-3`}>
                              <h3 className={`font-hand text-lg md:text-xl font-bold text-stone-800 relative inline-block break-all leading-tight ${highlightedTerms.has(term.id) ? 'text-yellow-900' : 'text-green-900'}`}>
                                {term.term}
                              </h3>
                              <button 
                                onClick={() => toggleHighlight(term.id)}
                                className={`p-1.5 rounded-lg border-2 transition-all flex-shrink-0 ${highlightedTerms.has(term.id) ? 'bg-yellow-400 text-stone-900 border-yellow-600 shadow-sm' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-400 hover:text-stone-600'}`}
                                title="Mark as important"
                              >
                                <Highlighter size={14} />
                              </button>
                            </div>
                            
                            <div className={`p-4 flex-1 flex flex-col relative z-10 ${studyMode ? 'blur-md hover:blur-none cursor-help select-none' : ''}`}>
                              <div className="mb-3 flex-1">
                                <span className="text-xs font-bold text-school-board uppercase tracking-wider bg-school-board/10 px-1.5 py-0.5 rounded mr-2 rtl:mr-0 rtl:ml-2 inline-block mb-1">
                                  {t('definition')}:
                                </span>
                                <p className="font-hand text-base text-stone-700 leading-relaxed break-words whitespace-pre-wrap inline">
                                  {term.definition}
                                </p>
                              </div>

                              {term.context && (
                                <div className="text-xs text-stone-500 italic border-l-2 rtl:border-l-0 rtl:border-r-2 border-stone-300 pl-3 rtl:pl-0 rtl:pr-3 mb-3 font-hand break-words whitespace-pre-wrap bg-stone-50 p-2 rounded-r mt-2">
                                  "{term.context}"
                                </div>
                              )}

                              {term.relatedTerms && term.relatedTerms.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 items-center mt-auto pt-3 border-t border-stone-100">
                                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-hand">{t('see_also')}</span>
                                  {term.relatedTerms.map((rt: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-hand border border-stone-200 hover:bg-stone-200 transition-colors cursor-default">
                                      {rt}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredTerms.length === 0 && (
                  <div className="text-center py-20 text-stone-400">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-hand text-xl">{t('no_terms_found')} "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Index Tabs */}
            <div className="w-8 hidden md:flex flex-col gap-1 sticky top-32 h-fit">
              {sortedKeys.map(letter => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className="w-8 h-8 flex items-center justify-center bg-white border-2 border-stone-300 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg hover:bg-school-board hover:text-white hover:border-school-board hover:w-10 transition-all font-hand font-bold text-sm text-stone-600 shadow-sm -ml-2 rtl:ml-0 rtl:-mr-2 z-10"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </NotebookPaper>
       </motion.div>
       
       <style>{`
         .highlight-yellow {
           background: linear-gradient(120deg, rgba(255, 226, 89, 0) 0%, rgba(255, 226, 89, 0.6) 100%);
           background-repeat: no-repeat;
           background-size: 100% 40%;
           background-position: 0 88%;
         }
       `}</style>
    </div>
  );
}