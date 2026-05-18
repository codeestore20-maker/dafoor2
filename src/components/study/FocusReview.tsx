import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotebookPaper } from '../shared/NotebookPaper';
import { AlertTriangle, Wrench, CheckCircle2, RefreshCw, Trophy, Eraser, X, Lightbulb, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { BrandSkeleton } from '../shared/BrandSkeleton';

// DrillSheet Component (Reused from ExamPredictor with modifications for Repair context)
interface DrillSheetProps {
  topic: string;
  onClose: () => void;
  fileId: string;
  onResolve: () => void;
  isResolved: boolean;
}

function DrillSheet({ topic, onClose, fileId, onResolve, isResolved }: DrillSheetProps) {
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['repairLesson', fileId, topic],
    queryFn: () => resourceService.generateRepairLesson(fileId, topic),
    staleTime: Infinity,
  });

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      // Adjusted positioning to respect sidebar (md:mr-[sidebar-width]) and mobile nav (pb-20)
      className="absolute inset-0 z-[60] bg-[#f0f0eb] overflow-y-auto custom-scrollbar pb-20 md:pb-0"
      style={{ 
        backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }}
    >
      {/* Header Bar - Compact */}
      <div className="sticky top-0 z-50 bg-[#f0f0eb]/90 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm">
         <button
          onClick={onClose}
          className="p-2 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-full border border-red-200 hover:border-red-600 transition-all transform hover:rotate-90 shadow-sm"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex-1 text-center">
            <span className="font-hand font-bold text-stone-400 text-xs uppercase tracking-widest">{t('repair')}</span>
        </div>
        
        <div className="w-8"></div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Title Area - Compact */}
        <div className="mb-8 relative text-center">
            <h2 className="font-hand text-2xl md:text-4xl font-black text-stone-800 leading-tight relative inline-block transform -rotate-1">
              {topic}
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-school-board" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.00025 7.00001C45.8003 3.66667 137.9 -1.99999 198 4.00001" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce shadow-md border-2 border-stone-100">
                <RefreshCw size={24} className="text-school-board animate-spin-slow" />
            </div>
            <p className="mt-4 font-hand text-lg text-stone-500 animate-pulse">{t('preparing_lesson')}</p>
          </div>
        ) : lesson ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12 relative">
            
            {/* LEFT COLUMN: The Concept (Compact Notebook) */}
            <div className="lg:col-span-7 flex flex-col gap-6 relative">
                <div className="relative group">
                    <div className="absolute top-1 left-1 w-full h-full bg-stone-200 rounded-xl border border-stone-300 transform rotate-1 transition-transform group-hover:rotate-2"></div>
                    
                    <div className="relative bg-white rounded-xl border border-stone-200 p-6 md:p-8 shadow-md overflow-hidden min-h-[250px]">
                        {/* Notebook Holes - Smaller */}
                        <div className="absolute left-3 top-0 bottom-0 w-6 border-r border-red-100 border-dashed flex flex-col justify-evenly py-4">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="w-3 h-3 rounded-full bg-stone-100 shadow-inner border border-stone-200 mx-auto"></div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="pl-6 md:pl-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700 transform -rotate-3 border border-yellow-200 shadow-sm">
                                    <Lightbulb size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="font-hand text-xl md:text-2xl font-bold text-stone-800">{t('quick_concept')}</h3>
                            </div>

                            <div className="prose prose-stone max-w-none">
                                <p className="font-serif text-base md:text-lg text-stone-700 leading-relaxed">
                                    {lesson.breakdown}
                                </p>
                                
                                {lesson.misconception && (
                                  <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                                    <p className="font-serif text-stone-700 leading-relaxed">
                                      <span className="font-bold text-red-600 block mb-1">{t('common_misconception')}</span>
                                      <span className="italic">{lesson.misconception}</span>
                                    </p>
                                  </div>
                                )}
                                
                                {lesson.mnemonic && (
                                  <blockquote className="mt-6 border-l-4 rtl:border-l-0 rtl:border-r-4 border-school-pencil pl-4 rtl:pl-0 rtl:pr-4 italic text-stone-600 bg-stone-50 py-3 my-4 rounded-r-lg">
                                    <span className="font-bold not-italic text-school-board block mb-1 text-sm uppercase tracking-wider">{t('mnemonic')}</span>
                                    "{lesson.mnemonic}"
                                  </blockquote>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extra "Note" pinned - Compact */}
                <div className="hidden lg:block w-4/5 mx-auto bg-[#fffcbb] p-3 shadow-sm transform -rotate-1 relative rounded-sm">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-400 shadow-sm border border-red-500"></div>
                    <p className="font-hand text-stone-700 text-sm text-center font-bold">
                        "{t('review_concept_above')}"
                    </p>
                </div>
            </div>

            {/* RIGHT COLUMN: The Test (Compact Card) */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                <div className="lg:sticky lg:top-20">
                    <div className="relative bg-white p-5 md:p-6 rounded-2xl border-2 border-school-board shadow-[4px_4px_0px_rgba(41,37,36,0.1)]">
                        
                        {/* "TEST" Tape */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-school-board text-white px-4 py-0.5 font-hand font-bold text-sm tracking-widest uppercase shadow-sm rounded-sm">
                            {t('test_yourself')}
                        </div>

                        <div className="mt-4 space-y-4">
                            <h4 className="font-serif text-base md:text-lg font-bold text-stone-800 leading-relaxed text-center" dir="auto">
                                {lesson.practiceQuestion.text}
                            </h4>

                            <div className="space-y-2">
                                {lesson.practiceQuestion.options.map((option: string, idx: number) => {
                                    const isCorrect = idx === lesson.practiceQuestion.correctAnswerIndex;
                                    const isSelected = selectedAnswer === idx;
                                    
                                    let baseStyle = "w-full p-3 rounded-lg border font-hand text-sm md:text-base font-bold transition-all transform active:scale-95 flex items-center justify-between gap-2 rtl:flex-row-reverse text-start";
                                    let stateStyle = "bg-white border-stone-200 text-stone-600 hover:border-school-board hover:bg-stone-50 hover:-translate-y-0.5";

                                    if (isAnswered) {
                                        if (isCorrect) stateStyle = "bg-[#dcfce7] border-[#22c55e] text-[#15803d] shadow-none";
                                        else if (isSelected) stateStyle = "bg-[#fee2e2] border-[#ef4444] text-[#b91c1c] opacity-70";
                                        else stateStyle = "bg-stone-50 border-stone-100 text-stone-300";
                                    } else if (isSelected) {
                                        stateStyle = "bg-school-board text-white border-school-board shadow-sm";
                                    }

                                    return (
                                    <button
                                        key={idx}
                                        disabled={isAnswered}
                                        onClick={() => {
                                        setSelectedAnswer(idx);
                                        setIsAnswered(true);
                                        }}
                                        className={`${baseStyle} ${stateStyle}`}
                                    >
                                        <span className="flex-1" dir="auto">{option}</span>
                                        {isAnswered && isCorrect && <CheckCircle2 size={18} className="shrink-0" />}
                                        {isAnswered && isSelected && !isCorrect && <X size={18} className="shrink-0" />}
                                    </button>
                                    );
                                })}
                            </div>

                            {isAnswered && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="pt-2 text-center"
                                >
                                    {selectedAnswer === lesson.practiceQuestion.correctAnswerIndex ? (
                                        <div className="inline-block bg-[#22c55e] text-white px-4 py-1.5 rounded-full font-hand font-bold text-sm shadow-md transform rotate-2">
                                            {t('correct_great_job')} 🎉
                                        </div>
                                    ) : (
                                        <div className="inline-block bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-full font-hand font-bold text-sm shadow-md">
                                            {t('review_concept_above')} 😅
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Finish Button - Compact */}
                    <div className="mt-6 flex justify-center pb-8 lg:pb-0">
                        <button 
                            onClick={() => {
                                if (onResolve && !isResolved) onResolve();
                                onClose();
                            }}
                            className="group relative px-6 py-3 bg-transparent border-none cursor-pointer"
                        >
                            <span className="absolute inset-0 bg-stone-800 rounded-xl transform transition-transform group-hover:translate-y-0.5 group-active:translate-y-1"></span>
                            <span className="absolute inset-0 bg-school-board rounded-xl border border-stone-900 transform -translate-y-0.5 -translate-x-0.5 transition-transform group-hover:translate-y-0 group-hover:translate-x-0"></span>
                            <span className="relative font-hand font-bold text-lg text-white flex items-center gap-2">
                                {isResolved ? t('close') : t('i_understand')} <CheckCircle2 size={18} />
                            </span>
                        </button>
                    </div>
                </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-red-500 font-hand text-lg">{t('lesson_load_error')}</div>
        )}
      </div>
    </motion.div>
  );
}

export function FocusReview() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const { data: mistakes = [], isLoading } = useQuery({
    queryKey: ['mistakes', fileId],
    queryFn: () => resourceService.getWeakPoints(fileId!),
    enabled: !!fileId,
    refetchOnMount: 'always'
  });

  const resolveMutation = useMutation({
    mutationFn: (weakPointId: string) => resourceService.resolveWeakPoint(fileId!, weakPointId),
    onMutate: async (weakPointId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['mistakes', fileId] });

      // Snapshot the previous value
      const previousMistakes = queryClient.getQueryData(['mistakes', fileId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['mistakes', fileId], (old: any[]) => {
        if (!old) return [];
        return old.map(m => 
          m.id === weakPointId ? { ...m, status: 'Mastered' } : m
        );
      });

      // Return a context object with the snapshotted value
      return { previousMistakes };
    },
    onError: (err, newTodo, context: any) => {
      queryClient.setQueryData(['mistakes', fileId], context?.previousMistakes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['mistakes', fileId] });
      setSelectedConcept(null); // Close modal if open
    }
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#fdfbf7]">
         <BrandSkeleton type="general" hideMessage={true} />
      </div>
    );
  }

  const activeMistakes = mistakes.filter((m: any) => m.status !== 'Mastered');
  const masteredMistakes = mistakes.filter((m: any) => m.status === 'Mastered');

  if (mistakes.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md text-center"
          >
            <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 border-4 border-white shadow-xl">
              <Trophy size={48} />
            </div>
            <h2 className="font-hand text-3xl font-bold text-stone-800 mb-4">
              {t('clean_slate')}
            </h2>
            <p className="font-hand text-xl text-stone-600 mb-8 leading-relaxed">
              {t('clean_slate_desc')}
            </p>
          </motion.div>
        </div>
      );
  }

  return (
    <div className="h-full relative overflow-hidden">
      <AnimatePresence>
        {selectedConcept && (
          <DrillSheet 
            key="drill-sheet"
            topic={selectedConcept} 
            fileId={fileId!} 
            onClose={() => setSelectedConcept(null)} 
            onResolve={() => {
                const point = mistakes.find((m: any) => m.concept === selectedConcept);
                if (point) resolveMutation.mutate(point.id);
            }}
            isResolved={mistakes.find((m: any) => m.concept === selectedConcept)?.status === 'Mastered'}
          />
        )}
      </AnimatePresence>

      <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.4 }}
        >
          <NotebookPaper title={t('focus_review_title')} className="max-w-3xl mx-auto">
            
            {activeMistakes.length > 0 ? (
              <div className="mb-8 bg-red-50 p-6 rounded-xl border-2 border-red-100 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                  <AlertTriangle className="text-red-500 w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-hand text-2xl font-bold text-red-800">
                    {t('attention_needed')}
                  </h3>
                  <p className="font-serif text-stone-600">
                    {t('attention_needed_desc', { count: activeMistakes.length })}
                  </p>
                </div>
              </div>
            ) : (
               <div className="mb-8 bg-green-50 p-6 rounded-xl border-2 border-green-100 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                  <CheckCircle2 className="text-green-600 w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-hand text-2xl font-bold text-green-800">
                    {t('all_clear')}
                  </h3>
                  <p className="font-hand text-stone-600">
                    {t('all_clear_desc')}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {activeMistakes.map((item: any) => (
                <div key={item.id} className="group relative bg-white border-2 border-stone-200 rounded-xl p-6 shadow-[4px_4px_0px_rgba(231,229,228,1)] hover:shadow-[6px_6px_0px_rgba(231,229,228,1)] hover:-translate-y-1 transition-all">
                  {/* Paper Texture Overlay */}
                  <div className="absolute inset-0 bg-paper-pattern opacity-10 pointer-events-none rounded-xl"></div>
                  
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-hand text-xl md:text-2xl font-bold text-stone-800 mb-2 break-words">
                        {item.concept}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500 font-hand">
                        <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                          <Eraser size={14} />
                          {item.mistakeCount} {t('mistakes')}
                        </span>
                        <span>•</span>
                        <span>{t('last_seen')} {new Date(item.lastMistake).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <button 
                        onClick={() => resolveMutation.mutate(item.id)}
                        className="p-3 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t('mark_resolved')}
                      >
                        <CheckCircle2 size={24} />
                      </button>
                      <button 
                        onClick={() => setSelectedConcept(item.concept)} 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-school-board text-white rounded-lg font-hand font-bold text-lg shadow-md hover:bg-school-board/90 transition-all active:scale-95"
                      >
                        <Wrench size={20} className="flip-rtl" />
                        {t('repair')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {masteredMistakes.length > 0 && (
              <div className="mt-12 pt-8 border-t-2 border-dashed border-stone-300">
                <h3 className="font-hand text-2xl font-bold text-school-board mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" />
                  {t('recently_repaired')}
                </h3>
                <div className="grid gap-4 opacity-70 hover:opacity-100 transition-opacity">
                  {masteredMistakes.map((item: any) => (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedConcept(item.concept)}
                      className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-white hover:border-school-board hover:shadow-md transition-all group cursor-pointer text-start"
                    >
                      <span className="font-hand text-lg md:text-xl text-stone-600 line-through decoration-stone-400 decoration-2 group-hover:no-underline group-hover:text-school-board transition-all break-words">
                        {item.concept}
                      </span>
                      <span className="text-green-600 font-bold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200 self-start md:self-auto flex-shrink-0">
                        {t('mastered_review')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </NotebookPaper>
        </motion.div>
      </div>
    </div>
  );
}
