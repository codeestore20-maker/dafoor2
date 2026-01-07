import React from 'react';
import { motion } from 'framer-motion';
import { NotebookPaper } from './NotebookPaper';
import { HandUnderline } from './Doodles';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DeepSummary() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
            {t('deep_summary_ready')}
          </h2>
          <p className="text-stone-600 mb-8">
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

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <NotebookPaper title={t('deep_summary')} className="max-w-3xl mx-auto">
          <article className="text-stone-800 leading-relaxed prose prose-stone max-w-none">
            {/* Header Metadata */}
            <div className="mb-8 not-prose border-b-2 border-dashed border-stone-300 pb-4">
               <div className="flex items-center gap-2 text-sm text-stone-500 italic">
                <span>{t('ai_generated')}</span>
                <span>•</span>
                <span>{t('min_read', { count: summary.readingTime || 5 })}</span>
                <span>•</span>
                <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Markdown Content */}
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p className="font-hand mb-4" {...props} />,
                h1: ({node, ...props}) => <h1 className="font-hand text-4xl font-bold text-school-board mb-6 mt-4" {...props} />,
                h2: ({node, ...props}) => (
                  <h2 className="font-hand text-2xl font-bold text-school-blue mb-4 mt-8 flex items-center gap-2" {...props}>
                    {props.children}
                    <HandUnderline className="w-16 h-2 text-school-blue opacity-30 inline-block ml-2" />
                  </h2>
                ),
                h3: ({node, ...props}) => <h3 className="font-hand text-xl font-bold text-stone-700 mb-3 mt-6" {...props} />,
                ul: ({node, ...props}) => <ul className="font-hand list-disc pl-6 space-y-2 marker:text-school-red mb-4" {...props} />,
                li: ({node, ...props}) => <li className="font-hand pl-1" {...props} />,
                strong: ({node, ...props}) => <span className="font-hand font-bold bg-yellow-100/80 px-1 rounded mx-0.5 box-decoration-clone" {...props} />,
                blockquote: ({node, ...props}) => (
                  <div className="bg-stone-100 p-6 rounded-lg border-l-4 border-school-pencil my-6">
                    <div className="italic text-stone-700 m-0">{props.children}</div>
                  </div>
                ),
              }}
            >
              {summary.content}
            </ReactMarkdown>

          </article>
        </NotebookPaper>
      </motion.div>
    </div>
  );
}