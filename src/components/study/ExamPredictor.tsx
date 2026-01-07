import React from 'react';
import { motion } from 'framer-motion';
import { NotebookPaper } from '../shared/NotebookPaper';
import { ChalkStar, Scribble } from '../shared/Doodles';
import { AlertCircle, TrendingUp, Target, RefreshCw, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';

interface ExamPredictorProps {
  onPractice?: () => void;
}

export function ExamPredictor({
  onPractice
}: ExamPredictorProps) {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: predictions, isLoading, isError } = useQuery({
    queryKey: ['predictions', fileId],
    queryFn: () => resourceService.getPredictions(fileId!),
    enabled: !!fileId,
    retry: false
  });

  const generateMutation = useMutation({
    mutationFn: () => resourceService.generatePredictions(fileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', fileId] });
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
         <div className="animate-spin mb-4">
            <RefreshCw size={32} />
         </div>
         <p className="font-hand text-xl">{t('analyzing_patterns')}</p>
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
          <p className="text-stone-600 mb-8">
            {t('exam_strategist_desc')}
          </p>
          
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-8 py-3 bg-school-board text-white rounded-xl font-hand font-bold text-xl shadow-[4px_4px_0px_rgba(41,37,36,1)] border-2 border-stone-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {generateMutation.isPending ? (
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
        </div>
      </div>
    );
  }

  return (
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

            {predictions.map((item: any, index: number) => (
              <div key={item.id} className="relative md:pl-12 rtl:md:pr-12 rtl:md:pl-0 group">
                {/* Rank Badge */}
                <div className="hidden md:flex absolute left-0 rtl:right-0 rtl:left-auto top-0 w-10 h-10 rounded-full bg-school-board text-white items-center justify-center font-hand font-bold text-xl shadow-md z-10 border-4 border-white transform group-hover:scale-110 transition-transform">
                  #{index + 1}
                </div>

                <div className="bg-white border-2 border-stone-200 rounded-xl p-6 shadow-[4px_4px_0px_rgba(231,229,228,1)] hover:shadow-[6px_6px_0px_rgba(231,229,228,1)] hover:-translate-y-1 transition-all">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                    <h3 className="font-hand text-2xl font-bold text-stone-800">
                      {item.topic}
                    </h3>
                    
                    {/* Stamp-like Probability Badge */}
                    <div className={`
                      transform rotate-[-2deg] px-3 py-1 border-2 rounded text-xs font-bold uppercase tracking-wider shadow-sm self-start md:self-auto
                      ${item.probability > 80 ? 'bg-red-50 text-red-600 border-red-600' : 
                        item.probability > 60 ? 'bg-orange-50 text-orange-600 border-orange-600' : 
                        'bg-blue-50 text-blue-600 border-blue-600'}
                    `}>
                      {item.frequency || (item.probability > 80 ? 'Very High' : 'High')} {t('probability')}
                    </div>
                  </div>

                  <p className="text-stone-700 mb-4 leading-relaxed">
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
                      onClick={onPractice} 
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-school-board text-school-board rounded-lg font-hand font-bold hover:bg-school-board hover:text-white transition-all shadow-sm active:translate-y-0.5"
                    >
                      <Target size={18} />
                      {t('practice_topic')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NotebookPaper>
      </motion.div>
    </div>
  );
}