import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, language: string) => void;
  isUploading: boolean;
  subjectId: string;
}

export function UploadModal({ isOpen, onClose, onUpload, isUploading, subjectId }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { t } = useTranslation();
  const { currentStep } = useOnboarding();

  const languages = ["English", "Arabic", "Spanish", "French", "German"];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    // Check file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError(t('error_file_type'));
      return false;
    }
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('error_file_size'));
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setError(null);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file, selectedLanguage);
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
            onClick={onClose}
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
                  {t('upload_file')}
                </h3>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {/* Language Selection */}
                <div>
                  <label className="block text-stone-600 font-bold font-hand text-lg mb-2">
                    {t('select_language')}
                  </label>
                  <p className="text-sm text-stone-500 mb-3 font-serif">
                    {t('upload_instruction')}
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
                        {t(lang.toLowerCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center ${
                    dragActive 
                      ? 'border-school-board bg-school-board/5 scale-[1.02]' 
                      : 'border-stone-300 hover:border-school-board hover:bg-stone-50'
                  } ${file ? 'bg-stone-50 border-solid border-stone-300' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".pdf,.txt"
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm border-2 border-stone-200 flex items-center justify-center">
                        <FileText size={32} className="text-school-board" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-800 text-lg">{file.name}</p>
                        <p className="text-stone-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="text-red-500 text-sm font-bold hover:underline mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                        <Upload size={32} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-700 text-lg">Click to upload or drag & drop</p>
                        <p className="text-stone-500 text-sm">PDF or Text files (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!file || isUploading}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                      !file || isUploading
                        ? 'bg-stone-300 cursor-not-allowed shadow-none'
                        : 'bg-school-board hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        <span>{t('upload_file')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}