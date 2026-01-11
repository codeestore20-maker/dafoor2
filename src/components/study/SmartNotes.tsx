import React, { useState, useEffect } from 'react';
import { NotebookPaper } from '../shared/NotebookPaper';
import { HandUnderline } from '../shared/Doodles';
import { motion } from 'framer-motion';
import { GitMerge, Sparkles, RefreshCw, PenTool } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export function SmartNotes() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [localNotes, setLocalNotes] = useState<string[]>([]);

  const { data: notes, isLoading, isError } = useQuery({
    queryKey: ['notes', fileId],
    queryFn: () => resourceService.getNotes(fileId!),
    enabled: !!fileId,
    retry: false
  });

  useEffect(() => {
    if (notes) {
      setLocalNotes(notes.map((n: any) => n.content));
    }
  }, [notes]);

  const generateMutation = useMutation({
    mutationFn: () => resourceService.generateNotes(fileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', fileId] });
    },
    onError: (error) => {
      console.error("Failed to generate notes:", error);
      alert("Failed to generate notes. Please try again.");
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
         <div className="animate-spin mb-4">
            <RefreshCw size={32} />
         </div>
         <p className="font-hand text-xl">{t('drafting_notes')}</p>
      </div>
    );
  }

  if (isError || !notes || !localNotes.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="bg-school-board/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-school-board">
            <PenTool size={40} />
          </div>
          <h2 className="font-hand text-3xl font-bold text-stone-800 mb-4">
            {t('smart_notes_empty')}
          </h2>
          <p className="font-hand text-stone-600 mb-8">
            {t('smart_notes_desc')}
          </p>
          
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-8 py-3 bg-school-board text-white rounded-xl font-hand font-bold text-xl shadow-[4px_4px_0px_rgba(41,37,36,1)] border-2 border-stone-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                {t('writing')}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                {t('generate_notes')}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <motion.div initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.4
    }}>
        <NotebookPaper title={t('smart_notes')} className="min-h-[600px] max-w-3xl mx-auto transform rotate-1">
          <div className="space-y-8">
            <div className="space-y-4">
                {localNotes.map((note, idx) => <p key={idx} className="relative break-words whitespace-pre-wrap" dir="auto">
                    <span className="font-bold text-school-board mr-2 rtl:mr-0 rtl:ml-2">•</span>
                    {note}
                    {idx === 0 && <span className="absolute -bottom-1 left-0 rtl:left-auto rtl:right-0 w-32 text-school-pencil opacity-70">
                      <HandUnderline />
                    </span>}
                </p>)}
            </div>

            {/* Concept Connector - Static for now, could be dynamic later */}
            <div className="my-8 p-5 bg-school-paper border-2 border-school-board/20 rounded-lg relative overflow-hidden group hover:border-school-board/40 transition-colors">
              <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-1 h-full bg-school-board"></div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-school-board/10 rounded-full text-school-board mt-1 flex-shrink-0">
                  <GitMerge size={20} />
                </div>
                <div>
                  <h4 className="font-hand text-lg font-bold text-school-board mb-2 break-words">
                    {t('key_concept')}
                  </h4>
                  <p className="text-stone-700 leading-relaxed break-words whitespace-pre-wrap">
                    {t('notes_cover_desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-school-board/30 rounded-lg bg-school-paper/50 transform -rotate-1">
              <p className="text-school-board font-bold mb-2">{t('study_tip')}</p>
              <ul className="list-disc pl-5 rtl:pl-0 rtl:pr-5 space-y-1">
                <li>{t('study_tip_1')}</li>
                <li>{t('study_tip_2')}</li>
              </ul>
            </div>
          </div>
        </NotebookPaper>
      </motion.div>
    </div>;
}