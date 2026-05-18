import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Check, AlertCircle, Loader2, BookOpen, Sparkles, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UploadDropzone } from '../../lib/uploadthing';
import { useNavigate } from 'react-router-dom';
import { resourceService, lessonsService } from '../../lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: { name: string, url: string, key: string, size: number, type: string }, language: string) => Promise<any>;
  isUploading: boolean;
  subjectId: string;
}

export function UploadModal({ isOpen, onClose, onUpload, isUploading, subjectId }: UploadModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("Arabic");
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<'upload' | 'details' | 'preparing'>('upload');
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';
  
  const languages = ["Arabic", "English", "Spanish", "French", "German"];

  const handleClose = () => {
    if (step === 'preparing') return; // Prevent closing during preparation
    setStep('upload');
    setUploadedFile(null);
    setFileName("");
    setError(null);
    setResourceId(null);
    setProgress(0);
    onClose();
  };

  // --- PREPARING LOGIC ---
  useEffect(() => {
    if (step === 'preparing' && resourceId) {
        const triggerJobs = async () => {
            try {
                resourceService.generateSummary(resourceId).catch(e => console.error("Summary gen bg error", e));
                resourceService.generateGlossary(resourceId).catch(e => console.error("Glossary gen bg error", e));
                resourceService.generateTopics(resourceId).then(async (topics) => {
                     if (Array.isArray(topics) && topics.length > 0) {
                        const steps: Array<'intro' | 'explanation' | 'question' | 'outro'> = ['intro', 'explanation', 'question', 'outro'];
                        topics.reduce(async (previousPromise, topic, index) => {
                            await previousPromise;
                            await new Promise(r => setTimeout(r, 1000));
                            steps.forEach(stepType => {
                                lessonsService.getStepContent(topic.id, stepType).catch(() => {});
                            });
                        }, Promise.resolve());
                     }
                }).catch(e => console.error("Topics gen bg error", e));
            } catch (e) {
                console.error("Background generation init failed", e);
            }
        };

        triggerJobs();

        let duration = 45000;
        if (uploadedFile?.size) {
            if (uploadedFile.size > 5 * 1024 * 1024) duration = 90000;
            else if (uploadedFile.size > 2 * 1024 * 1024) duration = 60000;
        }

        let currentProgress = 0;
        let timeoutId: NodeJS.Timeout;
        let isFinished = false;

        const simulateProgress = () => {
            if (isFinished) return;

            let increment = 0;
            let delay = 0;

            if (currentProgress < 20) {
                increment = Math.random() * 5 + 2; 
                delay = Math.random() * 200 + 100;
            } else if (currentProgress < 45) {
                if (Math.random() < 0.15) {
                    increment = 0;
                    delay = Math.random() * 1000 + 500;
                } else {
                    increment = Math.random() * 2 + 0.5;
                    delay = Math.random() * 400 + 200;
                }
            } else if (currentProgress < 60) {
                if (Math.random() < 0.3) {
                    increment = 0;
                    delay = Math.random() * 2000 + 1000;
                } else if (Math.random() < 0.2) {
                    increment = Math.random() * 10 + 5;
                    delay = Math.random() * 300 + 100;
                } else {
                    increment = Math.random() * 1 + 0.1;
                    delay = Math.random() * 600 + 300;
                }
            } else if (currentProgress < 85) {
                increment = Math.random() * 3 + 1;
                delay = Math.random() * 300 + 100;
            } else {
                if (currentProgress >= 99) {
                    increment = 0;
                    delay = 1000;
                } else {
                    const remaining = 99 - currentProgress;
                    increment = Math.random() * (remaining / 10);
                    delay = Math.random() * 800 + 400;
                }
            }

            const nextProgress = Math.min(currentProgress + increment, 99);
            currentProgress = nextProgress;
            setProgress(currentProgress);

            timeoutId = setTimeout(simulateProgress, delay);
        };

        simulateProgress();

        const finishTimeout = setTimeout(() => {
            isFinished = true;
            clearTimeout(timeoutId);
            setProgress(100);
            
            if (resourceId) {
                localStorage.setItem(`processing_resource_${resourceId}`, 'true');
            }

            setTimeout(() => {
                handleClose();
                navigate(`/app/study/${resourceId}?view=course_map`);
            }, 800);
        }, duration);

        return () => {
            isFinished = true;
            clearTimeout(timeoutId);
            clearTimeout(finishTimeout);
        };
    }
  }, [step, resourceId, uploadedFile, navigate]);

  const handleComplete = async () => {
    if (uploadedFile) {
      setIsSaving(true);
      try {
          const res = await onUpload({
            ...uploadedFile,
            name: fileName || uploadedFile.name
          }, selectedLanguage);
          
          if (res && res.id) {
              setResourceId(res.id);
              localStorage.setItem(`processing_resource_${res.id}`, 'true');
              setStep('preparing'); 
          } else {
             setError(t('error_no_id'));
          }
      } catch (e) {
          setError(t('error_processing_start'));
      } finally {
          setIsSaving(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: isRtl ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '100%' : '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} z-[101] w-full max-w-md bg-white shadow-2xl flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Upload size={20} className="text-school-board rtl:scale-x-[-1]" />
                  {step === 'upload' ? t('upload_file') : t('prepare_file')}
              </h2>
              {step !== 'preparing' && (
                <button 
                  onClick={handleClose}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {step === 'upload' && (
                <div className="space-y-4">
                  <p className="text-stone-600 font-medium text-center mb-4">
                     {t('upload_instruction_modal')}
                  </p>
                  
                  <div className="w-full">
                      <UploadDropzone
                          endpoint="pdfUploader"
                          onClientUploadComplete={(res) => {
                              if (res && res[0]) {
                                  const file = res[0];
                                  setUploadedFile({
                                      name: file.name,
                                      url: file.ufsUrl || file.url,
                                      key: file.key,
                                      size: file.size,
                                      type: file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
                                  });
                                  setFileName(file.name);
                                  setStep('details');
                              }
                          }}
                          onUploadError={(error: Error) => {
                              setError(error.message);
                          }}
                          appearance={{
                              container: "flex flex-col items-center justify-center gap-4 h-64 w-full border-2 border-dashed border-stone-300 rounded-xl hover:border-school-board bg-stone-50/50 transition-colors cursor-pointer relative",
                              button: "z-20 bg-school-board text-white font-bold rounded-lg px-6 py-2.5 hover:bg-school-board/90 transition-transform hover:scale-105 active:scale-95 shadow-sm",
                              label: "text-stone-500 text-sm font-bold hover:text-school-board cursor-pointer",
                              allowedContent: "text-xs text-stone-400 font-medium"
                          }}
                          content={{
                              button: ({ ready, isUploading, files, uploadProgress }) => {
                                  if (isUploading) return `${t('uploading')} ${uploadProgress}%`;
                                  if (files && files.length > 0) return t('confirm_upload');
                                  if (ready) return t('choose_file');
                                  return t('please_wait');
                              },
                              label: t('drag_drop_label'),
                              allowedContent: t('allowed_content')
                          }}
                      />
                  </div>
                </div>
              )}

              {step === 'details' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* File Name Input */}
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      {t('file_name')}
                    </label>
                    <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus-within:border-school-board focus-within:ring-2 focus-within:ring-school-board/20 transition-all">
                      <FileText size={18} className="text-stone-400" />
                      <input 
                        type="text" 
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-stone-800"
                      />
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      {t('document_language')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-1
                            ${selectedLanguage === lang 
                              ? 'border-school-board bg-school-board/5 text-school-board shadow-sm' 
                              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                            }
                          `}
                        >
                          {selectedLanguage === lang && <Check size={14} />}
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Details Preview */}
                  <div className="bg-school-board/5 border border-school-board/20 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-school-board shadow-sm shrink-0 border border-stone-100">
                          <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                          <p className="font-bold text-stone-800 truncate text-sm">{uploadedFile?.name}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                              {(uploadedFile?.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                      </div>
                  </div>
                </div>
              )}

              {step === 'preparing' && (
                <div className="py-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative w-32 h-32">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f5f5f4" strokeWidth="8" />
                            <circle 
                                cx="50" cy="50" r="45" 
                                fill="none" 
                                stroke="#285744" 
                                strokeWidth="8" 
                                strokeLinecap="round"
                                strokeDasharray={`${progress * 2.83} 283`}
                                className="transition-all duration-300 ease-out"
                            />
                        </svg>
                        
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold text-school-board">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h4 className="text-lg font-bold text-stone-800 flex items-center justify-center gap-2">
                            <Brain className="text-school-board animate-pulse" size={20} />
                            {t('analyzing')}
                        </h4>
                        <p className="text-stone-500 text-sm max-w-[250px]">
                            {progress < 30 ? t('analyzing_step_1') : 
                             progress < 70 ? t('analyzing_step_2') : 
                             t('analyzing_step_3')}
                        </p>
                    </div>

                    <div className="w-full space-y-3 pt-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress > 10 ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                                {progress > 10 ? <Check size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                            <span className={progress > 10 ? 'text-stone-700' : 'text-stone-400'}>{t('step_extract')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress > 40 ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                                {progress > 40 ? <Check size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                            <span className={progress > 40 ? 'text-stone-700' : 'text-stone-400'}>{t('step_struct')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${progress > 80 ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                                {progress > 80 ? <Check size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                            <span className={progress > 80 ? 'text-stone-700' : 'text-stone-400'}>{t('step_generate')}</span>
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {step !== 'preparing' && (
              <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex gap-3">
                {step === 'details' && (
                  <button 
                    onClick={() => setStep('upload')}
                    className="px-4 py-3 rounded-xl font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
                  >
                    {t('back')}
                  </button>
                )}
                
                <button 
                  onClick={step === 'upload' ? undefined : handleComplete}
                  disabled={step === 'upload' ? !uploadedFile : isSaving}
                  className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm
                    ${(step === 'upload' && !uploadedFile) || isSaving 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                      : 'bg-school-board text-white hover:bg-school-board/90'
                    }
                  `}
                >
                  {isSaving ? (
                    <><Loader2 size={18} className="animate-spin" /> {t('saving')}</>
                  ) : step === 'upload' ? (
                    <>{t('next_step')} <Check size={18} /></>
                  ) : (
                    <><Sparkles size={18} /> {t('start_magic')}</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}