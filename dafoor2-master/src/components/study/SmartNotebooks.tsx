import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { NotebookPaper } from '../shared/NotebookPaper';
import { Scribble } from '../shared/Doodles';
import { Bold, Italic, List, ListOrdered, Sparkles, Save, Highlighter, Pen } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export function SmartNotebooks() {
  const { fileId } = useParams();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage
  useEffect(() => {
    if (fileId) {
      const saved = localStorage.getItem(`notebook-${fileId}`);
      if (saved) {
        setContent(saved);
      } else {
        setContent('Chapter 1 Notes: \n\nThe mitochondria is essential because...');
      }
    }
  }, [fileId]);

  // Save to localStorage on content change (debounced)
  useEffect(() => {
    if (fileId) {
      const handler = setTimeout(() => {
        localStorage.setItem(`notebook-${fileId}`, content);
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [content, fileId]);

  const autoCompleteMutation = useMutation({
    mutationFn: (currentText: string) => resourceService.generateAutoComplete(fileId!, currentText),
    onSuccess: (data) => {
      setContent(prev => prev + " " + data.completion);
    },
    onError: (error) => {
      console.error("Auto complete failed:", error);
      alert("Failed to complete text. Please try again.");
    }
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleAutoComplete = () => {
    if (!fileId) return;
    autoCompleteMutation.mutate(content);
  };

  const handleSave = () => {
    if (fileId) {
      localStorage.setItem(`notebook-${fileId}`, content);
    }
  };

  return <div className="h-full overflow-y-auto custom-scrollbar relative">
      <motion.div initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.4
    }} className="min-h-full p-4 md:p-8 pb-32">
        
        <div className="max-w-4xl mx-auto relative">
          
          {/* Floating Toolbar (Sticky) */}
          <div className="sticky top-4 z-30 mb-6 mx-0 md:mx-4">
             <div className="bg-white/90 backdrop-blur-sm border-2 border-stone-200 rounded-xl shadow-xl p-2 flex flex-wrap justify-center items-center gap-2 max-w-fit mx-auto transform -rotate-1 transition-all hover:rotate-0">
                <div className="flex items-center gap-1 border-r rtl:border-r-0 rtl:border-l border-stone-300 pr-2 mr-2 rtl:pr-0 rtl:pl-2 rtl:mr-0 rtl:ml-2">
                    <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors" title="Bold">
                      <Bold size={18} />
                    </button>
                    <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors" title="Italic">
                      <Italic size={18} />
                    </button>
                    <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors" title="Highlight">
                      <Highlighter size={18} />
                    </button>
                </div>
                
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors" title="Bullet List">
                      <List size={18} />
                    </button>
                    <button onClick={handleAutoComplete} disabled={autoCompleteMutation.isPending} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors font-hand font-bold text-sm disabled:opacity-50 border border-yellow-300">
                      <Sparkles size={16} />
                      {autoCompleteMutation.isPending ? t('thinking') : t('ai_complete')}
                    </button>
                </div>

                <div className="border-l rtl:border-l-0 rtl:border-r border-stone-300 pl-2 ml-2 rtl:pl-0 rtl:pr-2 rtl:ml-0 rtl:mr-2">
                   <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 bg-school-board text-white rounded-lg hover:bg-school-board/90 transition-colors font-hand font-bold text-sm shadow-md">
                      <Save size={16} />
                      {t('save')}
                   </button>
                </div>
             </div>
          </div>

          {/* The Notebook Paper */}
          <NotebookPaper title={t('my_notebook')} className="min-h-[80vh] shadow-2xl">
            <textarea 
              ref={textareaRef}
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="w-full bg-transparent border-none resize-none focus:ring-0 font-hand text-xl leading-[32px] text-school-graphite p-0 overflow-hidden" 
              placeholder={t('start_writing_placeholder')}
              spellCheck={false}
              style={{
                 minHeight: '600px',
                 lineHeight: '32px'
              }}
              dir="auto"
            />
          </NotebookPaper>

        </div>
      </motion.div>
    </div>;
}