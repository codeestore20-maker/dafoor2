import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { NotebookPaper } from '../shared/NotebookPaper';
import { useQuery } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RepairLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept: string;
  onResolve?: () => void;
  isResolved?: boolean;
}

export function RepairLessonModal({
  isOpen,
  onClose,
  concept,
  onResolve,
  isResolved
}: RepairLessonModalProps) {
  const { fileId } = useParams();
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ['repairLesson', fileId, concept],
    queryFn: () => resourceService.generateRepairLesson(fileId!, concept),
    enabled: isOpen && !!concept && !!fileId,
    staleTime: Infinity // Keep the lesson once generated
  });

  // Reset quiz state when lesson changes or modal re-opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isOpen, lesson]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="w-full max-w-2xl max-h-[85dvh] md:max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 p-2 bg-white/80 rounded-full hover:bg-white text-stone-500 hover:text-red-500 transition-colors shadow-sm"
            >
              <X size={24} />
            </button>

            <NotebookPaper title={t('mini_lesson_title', { concept })} className="min-h-[500px] p-4 md:p-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-500">
                  <RefreshCw size={32} className="animate-spin mb-4" />
                  <p className="font-hand text-xl">{t('preparing_lesson')}</p>
                </div>
              ) : isError || !lesson ? (
                <div className="text-center p-8 text-red-500">
                  {t('lesson_load_error')}
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {/* Introduction */}
                  <div className="bg-yellow-50 p-4 md:p-6 rounded-lg border border-yellow-200 flex flex-col md:flex-row gap-4">
                    <div className="p-3 bg-yellow-100 rounded-full h-fit w-fit text-yellow-700">
                      <Lightbulb size={24} />
                    </div>
                    <div>
                      <h3 className="font-hand text-xl font-bold text-yellow-800 mb-2">
                        {t('concept_breakdown')}
                      </h3>
                      <p className="text-stone-700 leading-relaxed whitespace-normal break-words">
                        {lesson.breakdown}
                      </p>
                    </div>
                  </div>

                  {/* Core Content */}
                  <div className="prose prose-stone max-w-none">
                    <h4 className="font-hand text-2xl font-bold text-school-board flex items-center gap-2">
                      <BookOpen size={20} />
                      {t('key_explanation')}
                    </h4>
                    <p className="whitespace-normal break-words">
                      {t('common_misconception')} <span className="italic">{lesson.misconception}</span>
                    </p>
                    <blockquote className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-school-pencil pl-4 rtl:pl-0 rtl:pr-4 italic bg-stone-50 py-2 my-4 whitespace-normal break-words">
                      {t('mnemonic')} "{lesson.mnemonic}"
                    </blockquote>
                  </div>

                  {/* Practice Question */}
                  <div className="border-t-2 border-dashed border-stone-300 pt-6">
                    <h4 className="font-hand text-xl font-bold text-stone-800 mb-4">
                      {t('quick_check')}
                    </h4>
                    <p className="font-hand text-stone-800 mb-4 font-bold whitespace-normal break-words">{lesson.practiceQuestion.text}</p>
                    <div className="space-y-3">
                      {lesson.practiceQuestion.options.map((option: string, idx: number) => {
                        const isCorrect = idx === lesson.practiceQuestion.correctAnswerIndex;
                        const isSelected = selectedAnswer === idx;
                        
                        let borderClass = "border-stone-200 hover:border-school-board hover:bg-school-board/5";
                        if (isAnswered) {
                          if (isCorrect) borderClass = "border-green-500 bg-green-50";
                          else if (isSelected) borderClass = "border-red-500 bg-red-50";
                          else borderClass = "border-stone-200 opacity-50";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => {
                              setSelectedAnswer(idx);
                              setIsAnswered(true);
                            }}
                            className={`w-full text-left rtl:text-right p-4 rounded-lg border-2 transition-all group ${borderClass}`}
                          >
                            <div className="flex items-center justify-between rtl:flex-row-reverse">
                              <span className="font-hand text-stone-700 whitespace-normal break-words flex-1">
                                {option}
                              </span>
                              {isAnswered && isCorrect && (
                                <span className="text-green-600 font-bold">✓</span>
                              )}
                              {isAnswered && isSelected && !isCorrect && (
                                <span className="text-red-600 font-bold">✗</span>
                              )}
                              {!isAnswered && (
                                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-school-board transition-opacity rtl:rotate-180" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end rtl:justify-start pt-4">
                    <button
                      onClick={() => {
                        if (onResolve && !isResolved) onResolve();
                        onClose();
                      }}
                      className="px-6 py-2 bg-school-board text-white font-hand font-bold rounded-lg shadow hover:bg-school-board/90 transition-colors"
                    >
                      {isResolved ? t('close') : t('i_understand')}
                    </button>
                  </div>
                </div>
              )}
            </NotebookPaper>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
