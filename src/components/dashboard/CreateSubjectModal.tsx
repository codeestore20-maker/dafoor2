import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, FlaskConical, Globe, Book, Languages, Palette, Layout, Music, Laptop, Loader2, Upload, FileText, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (subject: any) => Promise<void> | void;
}

const ICONS = [
  { id: 'math', icon: Calculator, label: 'Math' },
  { id: 'science', icon: FlaskConical, label: 'Science' },
  { id: 'history', icon: Globe, label: 'History' },
  { id: 'literature', icon: Book, label: 'Literature' },
  { id: 'languages', icon: Languages, label: 'Languages' },
  { id: 'arts', icon: Palette, label: 'Arts' },
  { id: 'tech', icon: Laptop, label: 'Tech' },
  { id: 'other', icon: Layout, label: 'General' },
];

export function CreateSubjectModal({ isOpen, onClose, onCreate }: CreateSubjectModalProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    
    try {
      const newSubject = {
        name: name.trim(),
        icon: selectedIcon.id,
        color: '#285744', // Default minimal color
        file: file
      };
      
      await onCreate(newSubject);
      
      setName('');
      setSelectedIcon(ICONS[0]);
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Failed to create subject:', error);
    } finally {
      setIsLoading(false);
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
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]"
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
              <h2 className="text-xl font-bold text-stone-800">{t('create_new_subject')}</h2>
              <button 
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  {t('subject_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('subject_name_placeholder')}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-school-board/20 focus:border-school-board transition-all text-stone-800"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">
                  {t('subject_icon')}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {ICONS.map((iconConfig) => {
                    const Icon = iconConfig.icon;
                    const isSelected = selectedIcon.id === iconConfig.id;
                    return (
                      <button
                        key={iconConfig.id}
                        onClick={() => setSelectedIcon(iconConfig)}
                        className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-school-board/10 border-school-board text-school-board' 
                            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <Icon size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  {t('upload_syllabus')} <span className="text-stone-400 font-normal text-xs">(اختياري)</span>
                </label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`
                    border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all text-center
                    ${file ? 'border-school-board/50 bg-school-board/5' : 'border-stone-200 bg-stone-50 group-hover:border-stone-300 group-hover:bg-white'}
                  `}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${file ? 'bg-school-board/20 text-school-board' : 'bg-white border border-stone-200 text-stone-400'}`}>
                      {file ? <FileText size={24} /> : <Upload size={24} />}
                    </div>
                    <span className={`text-sm ${file ? 'text-school-board font-bold' : 'text-stone-500'}`}>
                      {file ? file.name : t('drop_file_here')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-stone-100 bg-stone-50/50">
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || isLoading}
                className="w-full bg-school-board text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-school-board/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> جاري الإنشاء...</>
                ) : (
                  <>{t('create_new_subject')} <Check size={18} /></>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
