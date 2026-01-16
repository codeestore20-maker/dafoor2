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
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { t } = useTranslation();
  
  const languages = ["English", "Arabic", "Spanish", "French", "German"];

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

                {/* UploadThing Dropzone */}
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-2 hover:border-school-board transition-colors bg-stone-50/50">
                    <UploadDropzone
                        endpoint="pdfUploader"
                        onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                                const file = res[0];
                                console.log("Files: ", res);
                                onUpload({
                                    name: file.name,
                                    url: file.ufsUrl || file.url,
                                    key: file.key,
                                    size: file.size,
                                    type: file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
                                }, selectedLanguage);
                                onClose();
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