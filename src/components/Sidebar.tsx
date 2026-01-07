import React from 'react';
import { Plus, Calculator, FlaskConical, Globe, Book, Languages, Music, Palette, Clock, FileText, Laptop, Layout, Settings, LogOut, Home, Bookmark, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HandArrow, Scribble } from './Doodles';

interface SidebarProps {
  subjects: any[];
  selectedSubjectId: string | null;
  onSelectSubject: (id: string) => void;
  onAddSubject: () => void;
  onGoHome: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, any> = {
  math: Calculator,
  science: FlaskConical,
  history: Globe,
  literature: Book,
  languages: Languages,
  arts: Palette,
  music: Music,
  tech: Laptop,
  other: Layout,
  default: Book
};

export function Sidebar({ subjects, selectedSubjectId, onSelectSubject, onAddSubject, onGoHome, isOpen, onClose }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const SidebarContent = (
    <div className="w-64 bg-[#F5F5F0] h-full flex flex-col shadow-2xl relative z-20 transition-all duration-300 border-r-4 border-stone-300" 
         style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/notebook.png")' }}>
      
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 rtl:left-4 rtl:right-auto md:hidden p-2 text-stone-500 hover:text-red-500 transition-colors z-50"
      >
        <X size={24} />
      </button>

      {/* Binding Effect */}
      <div className="absolute left-0 rtl:right-0 rtl:left-auto top-0 bottom-0 w-6 bg-stone-800/5 border-r rtl:border-l rtl:border-r-0 border-dashed border-stone-400/30 pointer-events-none z-10 flex flex-col items-center py-4 gap-6 overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
           <div key={i} className="w-2.5 h-2.5 rounded-full bg-stone-300 shadow-inner border border-stone-400"></div>
        ))}
      </div>

      {/* Header Area */}
      <div className="pl-10 pr-4 rtl:pr-10 rtl:pl-4 pt-6 pb-4 flex flex-col items-center gap-4 relative">
        <div className="flex items-center gap-2 w-full transform -rotate-1 justify-center md:justify-start">
          <div className="w-10 h-10 bg-school-board text-white rounded-lg flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.2)] border-2 border-stone-800">
             <span className="font-hand font-bold text-xl">S</span>
          </div>
          <span className="font-hand text-2xl font-bold text-stone-800 tracking-tight drop-shadow-sm">{t('app_name')}</span>
        </div>
        
        {/* Home Button */}
        <button 
          onClick={() => { onGoHome(); onClose(); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden ${
            !selectedSubjectId ? 'text-school-board font-bold' : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          {/* Active Indicator */}
          {!selectedSubjectId && (
            <div className="absolute left-0 rtl:right-0 rtl:left-auto top-1/2 -translate-y-1/2 text-school-board">
              <HandArrow className="w-4 h-4 transform rotate-180 rtl:rotate-0" />
            </div>
          )}

          <Home size={20} className={`relative z-10 ${!selectedSubjectId ? 'ml-4 rtl:mr-4 rtl:ml-0' : ''}`} />
          <span className="font-hand text-base relative z-10">{t('dashboard')}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-dashed border-stone-300 mb-2 opacity-50"></div>

      {/* Subjects List */}
      <div className="flex-1 overflow-y-auto py-2 pl-8 pr-3 rtl:pr-8 rtl:pl-3 custom-scrollbar space-y-1">
        <h3 className="px-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 font-serif flex items-center gap-1.5">
          <Bookmark size={10} />
          {t('your_subjects')}
        </h3>
        
        {subjects.map((subject) => {
          const Icon = ICON_MAP[subject.icon] || ICON_MAP.default;
          const isSelected = selectedSubjectId === subject.id;
          
          return (
            <button
              key={subject.id}
              onClick={() => { onSelectSubject(subject.id); onClose(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 group relative ${
                isSelected ? 'text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 rtl:right-0 rtl:left-auto top-1/2 -translate-y-1/2 text-school-board">
                   <HandArrow className="w-4 h-4 transform rotate-180 rtl:rotate-0" />
                </div>
              )}
              
              <Icon size={18} className={`transition-transform group-hover:scale-110 ${isSelected ? 'text-school-board' : ''}`} />
              <span className="font-hand text-lg truncate">{subject.name}</span>
            </button>
          );
        })}

        <button 
          onClick={() => { onAddSubject(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 mt-4 text-stone-400 hover:text-school-board hover:bg-stone-100 rounded-lg transition-all group border-2 border-dashed border-stone-300 hover:border-school-board"
        >
          <div className="w-6 h-6 rounded-full bg-stone-200 group-hover:bg-school-board group-hover:text-white flex items-center justify-center transition-colors">
            <Plus size={14} />
          </div>
          <span className="font-hand font-bold text-sm">{t('add_subject')}</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-300 bg-[#EBEBE6]">
        <div className="flex items-center justify-between gap-2">
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
             title={t('switch_language')}
           >
             <Languages size={18} />
             <span className="font-hand text-sm font-bold">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
           </button>
           
           <button className="text-stone-400 hover:text-stone-600">
             <Settings size={18} />
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always visible on large screens) */}
      <div className="hidden md:block h-full">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} z-50 md:hidden h-full`}
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
