import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotebookPaper } from '../shared/NotebookPaper';
import { ChalkStar, Scribble } from '../shared/Doodles';
import { AlertCircle, TrendingUp, Target, RefreshCw, Sparkles, X, BookOpen, Lightbulb, CheckCircle2, ChevronDown } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { BrandSkeleton } from '../shared/BrandSkeleton';

// DrillSheet Component
interface DrillSheetProps {
  topic: string;
  onClose: () => void;
  fileId: string;
}

function DrillSheet({ topic, onClose, fileId }: DrillSheetProps) {
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
            <span className="font-hand font-bold text-stone-400 text-xs uppercase tracking-widest">{t('topic_drill')}</span>
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
                <Sparkles size={24} className="text-school-board animate-spin-slow" />
            </div>
            <p className="mt-4 font-hand text-lg text-stone-500 animate-pulse">{t('generating_drill')}</p>
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
                            onClick={onClose}
                            className="group relative px-6 py-3 bg-transparent border-none cursor-pointer"
                        >
                            <span className="absolute inset-0 bg-stone-800 rounded-xl transform transition-transform group-hover:translate-y-0.5 group-active:translate-y-1"></span>
                            <span className="absolute inset-0 bg-school-board rounded-xl border border-stone-900 transform -translate-y-0.5 -translate-x-0.5 transition-transform group-hover:translate-y-0 group-hover:translate-x-0"></span>
                            <span className="relative font-hand font-bold text-lg text-white flex items-center gap-2">
                                {t('finish_drill')} <CheckCircle2 size={18} />
                            </span>
                        </button>
                    </div>
                </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-red-500 font-hand text-lg">{t('error_loading_drill')}</div>
        )}
      </div>
    </motion.div>
  );
}

interface ExamPredictorProps {
  onPractice?: () => void;
}

export function ExamPredictor({
  onPractice
}: ExamPredictorProps) {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { data: predictions, isLoading, isError } = useQuery({
    queryKey: ['predictions', fileId],
    queryFn: () => resourceService.getPredictions(fileId!),
    enabled: !!fileId,
    retry: false
  });

  const [isProcessing, setIsProcessing] = React.useState(() => 
    localStorage.getItem(`processing_predictions_${fileId}`) === 'true'
  );

  // Clear processing state if we have results
  React.useEffect(() => {
    if (predictions && predictions.length > 0 && isProcessing) {
      localStorage.removeItem(`processing_predictions_${fileId}`);
      setIsProcessing(false);
    }
  }, [predictions, isProcessing, fileId]);

  const generateMutation = useMutation({
    mutationFn: async () => {
        localStorage.setItem(`processing_predictions_${fileId}`, 'true');
        setIsProcessing(true);
        return resourceService.generatePredictions(fileId!);
    },
    onSuccess: () => {
      localStorage.removeItem(`processing_predictions_${fileId}`);
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ['predictions', fileId] });
    },
    onError: () => {
        localStorage.removeItem(`processing_predictions_${fileId}`);
        setIsProcessing(false);
    }
  });

  if (isLoading || (!predictions && isProcessing)) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#fdfbf7]">
         <BrandSkeleton type="general" message={isProcessing ? t('analyzing_patterns') : undefined} hideMessage={!isProcessing} />
      </div>
    );
  }

  if (isError || !predictions || !predictions.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="bg-school-board/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-school-board">
            <TrendingUp size={40} />
          </div>
          <h2 className="font-hand text-3xl font-bold text-stone-800 mb-4">
            {t('exam_strategist')}
          </h2>
          <p className="font-hand text-stone-600 mb-8">
            {t('exam_strategist_desc')}
          </p>
          
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || isProcessing}
            className="px-8 py-3 bg-school-board text-white rounded-xl font-hand font-bold text-xl shadow-[4px_4px_0px_rgba(41,37,36,1)] border-2 border-stone-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {generateMutation.isPending || isProcessing ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                {t('analyzing')}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                {t('predict_topics')}
              </>
            )}
          </button>
          
          {generateMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              <span>{t('error_generating_predictions') || "Failed to generate predictions. Please try again."}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden">
      <AnimatePresence>
        {selectedTopic && (
          <DrillSheet 
            key="drill-sheet"
            topic={selectedTopic} 
            fileId={fileId!} 
            onClose={() => setSelectedTopic(null)} 
          />
        )}
      </AnimatePresence>

      <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <motion.div initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.4
        }}>
          <NotebookPaper title={t('exam_predictor_title')} className="max-w-3xl mx-auto">
            <div className="mb-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3 shadow-sm">
              <TrendingUp className="text-school-board w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-hand text-xl font-bold text-school-board">
                  {t('ai_analysis_complete')}
                </h3>
                <p className="text-sm text-stone-600">
                  {t('high_probability_msg')}
                </p>
              </div>
            </div>

            <div className="space-y-8 relative">
               {/* Vertical Timeline Line */}
               <div className="absolute left-[19px] rtl:right-[19px] rtl:left-auto top-4 bottom-4 w-0.5 bg-red-300/50 hidden md:block"></div>

              {predictions.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No predictions found. Try regenerating.</p>
                </div>
              ) : (
                predictions.map((item: any, index: number) => {
                  // Check if we have cached drill data for this topic to style the button
                  const hasDrillData = queryClient.getQueryData(['repairLesson', fileId, item.topic]);

                  return (
                  <div key={item.id} className="relative md:pl-12 rtl:md:pr-12 rtl:md:pl-0 group">
                    {/* Rank Badge */}
                    <div className="hidden md:flex absolute left-0 rtl:right-0 rtl:left-auto top-0 w-10 h-10 rounded-full bg-school-board text-white items-center justify-center font-hand font-bold text-xl shadow-md z-10 border-4 border-white transform group-hover:scale-110 transition-transform">
                      #{index + 1}
                    </div>

                    <div className="bg-white border-2 border-stone-200 rounded-xl p-6 shadow-[4px_4px_0px_rgba(231,229,228,1)] hover:shadow-[6px_6px_0px_rgba(231,229,228,1)] hover:-translate-y-1 transition-all">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                        <h3 className="font-hand text-xl md:text-2xl font-bold text-stone-800 break-words relative inline-block">
                          <span className="relative z-10">{item.topic}</span>
                          {/* Highlighter effect */}
                          <span className="absolute bottom-1 left-0 right-0 h-3 bg-yellow-200/60 -rotate-1 z-0 rounded-sm"></span>
                        </h3>
                        
                        {/* Stamp-like Probability Badge */}
                        <div className={`
                          transform rotate-[-2deg] px-3 py-1 border-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm self-start md:self-auto flex-shrink-0
                          ${item.probability > 80 ? 'bg-red-50 text-red-600 border-red-600' : 
                            item.probability > 60 ? 'bg-orange-50 text-orange-600 border-orange-600' : 
                            'bg-blue-50 text-blue-600 border-blue-600'}
                        `}>
                          {item.frequency || (item.probability > 80 ? 'Very High' : 'High')} {t('probability')}
                        </div>
                      </div>

                      <p className="text-stone-700 mb-4 leading-relaxed break-words">
                        <span className="font-bold text-stone-900 bg-yellow-100 px-1 rounded">{t('insight')}:</span> {item.reasoning || item.context || "Focus on key concepts related to this topic."}
                      </p>

                      {item.keyConcepts && item.keyConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {item.keyConcepts.map((concept: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-school-board/5 text-school-board rounded-full text-xs font-bold border border-school-board/20 hover:bg-school-board hover:text-white transition-colors cursor-default">
                              #{concept}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100 border-dashed">
                        <div className="flex items-center gap-2 text-sm text-stone-500 font-hand italic">
                          <AlertCircle size={16} />
                          <span>{t('appears_frequently')}</span>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedTopic(item.topic)}
                          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-hand font-bold transition-all shadow-sm active:translate-y-0.5 border-2
                            ${hasDrillData 
                              ? 'bg-school-board text-white border-school-board hover:bg-school-board/90' 
                              : 'bg-white text-school-board border-school-board hover:bg-school-board/5'
                            }
                          `}
                        >
                          {hasDrillData ? <BookOpen size={18} /> : <Sparkles size={18} />}
                          {hasDrillData ? t('review_drill') : t('generate_drill')}
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                }))}
            </div>
          </NotebookPaper>
        </motion.div>
      </div>
    </div>
  );
}