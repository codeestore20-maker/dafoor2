import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import { UploadDropzone } from '../../lib/uploadthing';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: { name: string, url: string, key: string, size: number, type: string }, language: string) => void;
  isUploading: boolean;
  subjectId: string;
}

export function UploadModal({ isOpen, onClose, onUpload, isUploading, subjectId }: UploadModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("Arabic");
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<'upload' | 'details'>('upload');
  
  const { t } = useTranslation();
  
  const languages = ["Arabic", "English", "Spanish", "French", "German"];

  const handleClose = () => {
    setStep('upload');
    setUploadedFile(null);
    setFileName("");
    setError(null);
    onClose();
  };

  const handleComplete = () => {
    if (uploadedFile) {
      onUpload({
        ...uploadedFile,
        name: fileName || uploadedFile.name
      }, selectedLanguage);
      handleClose();
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
                <button 
                  onClick={handleClose}
                  className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {step === 'upload' ? (
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
                        />
                    </div>
                  </div>
                ) : (
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
                        className="flex-[2] py-3 rounded-xl font-bold font-hand bg-school-board text-white border-2 border-stone-800 shadow-[4px_4px_0px_rgba(41,37,36,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        حفظ وبدء الدراسة
                      </button>
                    </div>

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