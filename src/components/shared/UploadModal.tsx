import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Check, AlertCircle, Loader2, BookOpen, Sparkles, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
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
  const [step, setStep] = useState<'upload' | 'details'>('upload');
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  
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
        // 1. Trigger Background Jobs
        const triggerJobs = async () => {
            try {
                // 1. Independent jobs (Fire & Forget)
                // We do NOT await these. They run completely independently.
                resourceService.generateSummary(resourceId).catch(e => console.error("Summary gen bg error", e));
                resourceService.generateGlossary(resourceId).catch(e => console.error("Glossary gen bg error", e));

                // 2. Topics Generation (Chain Logic)
                // We start this, but we don't block the UI progress on it.
                // Once topics are ready, we TRIGGER lesson content generation for the first few topics.
                resourceService.generateTopics(resourceId).then(async (topics) => {
                     // Once topics are ready, trigger lesson content generation in background
                     if (Array.isArray(topics) && topics.length > 0) {
                        const steps: Array<'intro' | 'explanation' | 'question' | 'outro'> = ['intro', 'explanation', 'question', 'outro'];
                        
                        // Fire requests for all topics' content sequentially to be nice to the server
                        // We use a "reduce" chain to ensure they don't all hit at once, but we don't await the whole chain
                        topics.reduce(async (previousPromise, topic, index) => {
                            await previousPromise;
                            // Small delay between topics
                            await new Promise(r => setTimeout(r, 1000));
                            
                            // Trigger all steps for this topic in parallel
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

        // 2. Start Realistic Fake Progress (Simulation)
        let duration = 45000; // Increased base duration
        if (uploadedFile?.size) {
            if (uploadedFile.size > 5 * 1024 * 1024) duration = 90000; // 90s for large > 5MB
            else if (uploadedFile.size > 2 * 1024 * 1024) duration = 60000; // 60s for medium > 2MB
        }

        let currentProgress = 0;
        let timeoutId: NodeJS.Timeout;
        let isFinished = false;

        const simulateProgress = () => {
            if (isFinished) return;

            let increment = 0;
            let delay = 0;

            // More realistic progress curve with stalls and jumps
            if (currentProgress < 20) {
                // Initial rapid startup
                increment = Math.random() * 5 + 2; 
                delay = Math.random() * 200 + 100;
            } 
            else if (currentProgress < 45) {
                // Parsing phase - steady but slower
                if (Math.random() < 0.15) {
                    increment = 0; // Stall
                    delay = Math.random() * 1000 + 500;
                } else {
                    increment = Math.random() * 2 + 0.5;
                    delay = Math.random() * 400 + 200;
                }
            } 
            else if (currentProgress < 60) {
                // Analysis phase - often stalls then jumps
                if (Math.random() < 0.3) {
                    increment = 0; // Thinking...
                    delay = Math.random() * 2000 + 1000;
                } else if (Math.random() < 0.2) {
                    increment = Math.random() * 10 + 5; // Eureka moment!
                    delay = Math.random() * 300 + 100;
                } else {
                    increment = Math.random() * 1 + 0.1;
                    delay = Math.random() * 600 + 300;
                }
            } 
            else if (currentProgress < 85) {
                // Generation phase - consistent speed
                increment = Math.random() * 3 + 1;
                delay = Math.random() * 300 + 100;
            } 
            else {
                // Final polish - asymptotic approach to 99%
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

        // Start simulation
        simulateProgress();

        // Force completion logic
        const finishTimeout = setTimeout(() => {
            isFinished = true;
            clearTimeout(timeoutId);
            setProgress(100);
            
            // Mark as processing in localStorage for persistence
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
  }, [step, resourceId]);

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
              // Set initial processing flag
              localStorage.setItem(`processing_resource_${res.id}`, 'true');
              setStep('preparing'); 
          } else {
             setError("لم يتم استلام معرف الملف. يرجى المحاولة مرة أخرى.");
          }
      } catch (e) {
          setError("فشل في بدء المعالجة");
      } finally {
          setIsSaving(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden border-2 border-stone-200"
            >
              {/* Header */}
              <div className="p-4 border-b-2 border-stone-100 flex items-center justify-between bg-stone-50">
                <h3 className="text-xl font-bold font-hand text-stone-800 flex items-center gap-2">
                  <Upload size={20} className="text-school-board flip-rtl" />
                  {step === 'upload' ? t('upload_file') : 'إعداد الملف'}
                </h3>
                {step !== 'preparing' && (
                  <button 
                    onClick={handleClose}
                    className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {step === 'upload' && (
                  /* STEP 1: UPLOAD */
                  <div className="space-y-4">
                    <p className="text-stone-600 font-medium text-center mb-4">
                       قم برفع الملف أولاً، ثم سنقوم بضبط الإعدادات.
                    </p>
                    
                    <div className="border-2 border-dashed border-stone-300 rounded-xl p-2 hover:border-school-board transition-colors bg-stone-50/50">
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
                                button: "bg-school-board text-white font-hand font-bold rounded-lg px-4 py-2 hover:bg-school-board/90",
                                container: "flex flex-col items-center justify-center gap-2 text-stone-600 font-hand",
                                label: "text-stone-500 text-sm hover:text-school-board",
                                allowedContent: "text-xs text-stone-400"
                            }}
                            content={{
                                button: ({ ready, isUploading, files, uploadProgress }) => {
                                    if (isUploading) return `جاري الرفع... ${uploadProgress}%`;
                                    if (files && files.length > 0) return "تأكيد وبدء الرفع";
                                    if (ready) return "اختر ملفاً";
                                    return "جاري التحميل...";
                                },
                                label: "اسحب الملف هنا أو اضغط للاختيار",
                                allowedContent: "PDF, DOCX, TXT حتى 32 ميجابايت"
                            }}
                        />
                    </div>
                  </div>
                )}

                {step === 'details' && (
                  /* STEP 2: DETAILS */
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    {/* File Name Input */}
                    <div>
                      <label className="block text-stone-700 font-bold font-hand text-lg mb-2">
                        اسم الملف
                      </label>
                      <div className="flex items-center gap-2 bg-stone-50 border-2 border-stone-200 rounded-xl px-3 py-2 focus-within:border-school-board focus-within:ring-2 focus-within:ring-school-board/20 transition-all">
                        <FileText size={20} className="text-stone-400" />
                        <input 
                          type="text" 
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 w-full font-hand font-bold text-stone-800 placeholder-stone-400"
                          placeholder="أدخل اسم الملف..."
                        />
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div>
                      <label className="block text-stone-700 font-bold font-hand text-lg mb-1">
                        لغة الشرح والدراسة
                      </label>
                      <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-lg mb-3 flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        اختر اللغة التي تريد أن يشرح لك المعلم بها (وليس لغة الملف الأصلية).
                      </p>
                      
                      <div className="flex gap-2 flex-wrap">
                        {languages.map(lang => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-4 py-2 rounded-lg font-bold font-hand border-2 transition-all ${
                              selectedLanguage === lang 
                                ? 'bg-school-board text-white border-school-board shadow-md' 
                                : 'bg-white text-stone-600 border-stone-200 hover:border-school-board'
                            }`}
                          >
                            {t(lang.toLowerCase()) || lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setStep('upload')}
                        className="flex-1 py-3 rounded-xl font-bold font-hand border-2 border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
                      >
                        إلغاء وإعادة الرفع
                      </button>
                      <button 
                        onClick={handleComplete}
                        disabled={isSaving}
                        className="flex-[2] py-3 rounded-xl font-bold font-hand bg-school-board text-white border-2 border-stone-800 shadow-[4px_4px_0px_rgba(41,37,36,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                        {isSaving ? "جاري الحفظ..." : "حفظ وبدء الدراسة"}
                      </button>
                    </div>

                  </div>
                )}

                {step === 'preparing' && (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-school-board/20 rounded-full animate-ping blur-xl" />
                        <div className="relative bg-white p-6 rounded-full border-4 border-stone-100 shadow-xl">
                            <Sparkles size={48} className="text-school-board animate-pulse" />
                        </div>
                        <motion.div 
                            className="absolute -top-2 -right-2 bg-white p-2 rounded-full border border-stone-100 shadow-sm"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Brain size={20} className="text-sky-500" />
                        </motion.div>
                        <motion.div 
                            className="absolute -bottom-2 -left-2 bg-white p-2 rounded-full border border-stone-100 shadow-sm"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        >
                            <BookOpen size={20} className="text-rose-500" />
                        </motion.div>
                    </div>

                    <h3 className="text-2xl font-bold font-hand text-stone-800 mb-2">
                        {progress < 30 ? "جاري فحص الملف..." : 
                         progress < 60 ? "يتم استخراج الدروس..." :
                         progress < 90 ? "بناء الشرح والمفاهيم..." : "نضع اللمسات الأخيرة..."}
                    </h3>
                    
                    <p className="text-stone-500 font-hand mb-8 max-w-xs mx-auto text-lg">
                        يقوم الذكاء الاصطناعي الآن بتجهيز مسارك التعليمي المخصص.
                    </p>

                    <div className="w-full max-w-sm bg-stone-100 rounded-full h-4 overflow-hidden border border-stone-200 p-0.5 mb-2">
                        <motion.div 
                            className="h-full bg-school-board rounded-full stripe-pattern relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "linear" }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] skew-x-12" />
                        </motion.div>
                    </div>
                    
                    <span className="text-xs font-bold text-stone-400 font-mono tracking-widest">
                        {Math.round(progress)}%
                    </span>

                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}