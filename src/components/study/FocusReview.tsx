import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NotebookPaper } from '../shared/NotebookPaper';
import { AlertTriangle, Wrench, CheckCircle2, RefreshCw, Trophy, Eraser } from 'lucide-react';
import { RepairLessonModal } from './RepairLessonModal';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export function FocusReview() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const { data: mistakes = [], isLoading } = useQuery({
    queryKey: ['mistakes', fileId],
    queryFn: () => resourceService.getWeakPoints(fileId!),
    enabled: !!fileId
  });

  const resolveMutation = useMutation({
    mutationFn: (weakPointId: string) => resourceService.resolveWeakPoint(fileId!, weakPointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mistakes', fileId] });
      setSelectedConcept(null); // Close modal if open
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
         <div className="animate-spin mb-4">
            <RefreshCw size={32} />
         </div>
         <p className="font-hand text-xl">{t('gathering_review')}</p>
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
                  <div>
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

      <RepairLessonModal 
        isOpen={!!selectedConcept} 
        onClose={() => setSelectedConcept(null)} 
        concept={selectedConcept || ''}
        onResolve={() => {
            const point = mistakes.find((m: any) => m.concept === selectedConcept);
            if (point) resolveMutation.mutate(point.id);
        }}
        isResolved={mistakes.find((m: any) => m.concept === selectedConcept)?.status === 'Mastered'}
      />
    </div>
  );
}