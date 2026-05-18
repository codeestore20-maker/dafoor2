import React from 'react';
import { Plus, Calculator, FlaskConical, Globe, Book, Languages, Music, Palette, FileText, Laptop, Layout, Settings, Home, Bookmark, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HandArrow } from '../shared/Doodles';

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
    <div className="w-64 bg-school-paper bg-paper-pattern h-full flex flex-col shadow-2xl relative z-20 transition-all duration-300 border-r-2 border-stone-300/60">
      
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 rtl:left-4 rtl:right-auto xl:hidden p-2 text-school-graphite hover:text-school-red transition-colors z-50"
      >
        <X size={24} />
      </button>

      {/* Notebook Binding - Red margin line */}
      <div className="absolute left-8 rtl:right-8 rtl:left-auto top-0 bottom-0 w-[2px] bg-school-red/20 pointer-events-none z-10"></div>
      {/* Second line */}
      <div className="absolute left-9 rtl:right-9 rtl:left-auto top-0 bottom-0 w-[1px] bg-school-red/10 pointer-events-none z-10"></div>

      {/* Notebook Ring Holes */}
      <div className="absolute left-0 rtl:right-0 rtl:left-auto top-0 bottom-0 w-5 flex flex-col items-center justify-start py-6 gap-8 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 20 }).map((_, i) => (
           <div key={i} className="w-3 h-3 rounded-full border-2 border-stone-400/50 bg-school-paper"></div>
        ))}
      </div>

      {/* Header Area */}
      <div className="pl-12 pr-4 rtl:pr-12 rtl:pl-4 pt-6 pb-4 flex flex-col items-center gap-4 relative">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 w-full justify-center md:justify-start">
          <div className="w-11 h-11 bg-school-board text-school-chalk rounded-lg flex items-center justify-center border-2 border-school-board/80 shadow-[3px_3px_0px_rgba(0,0,0,0.15)] transform -rotate-2">
             <GraduationCap size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-hand text-xl font-bold text-school-board tracking-tight block leading-tight">دافور</span>
            <span className="font-hand text-[10px] text-school-graphite/50 font-bold -mt-1 block">Dafoor</span>
          </div>
        </div>
        
        {/* Tape decoration */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-5 bg-school-pencil/30 rotate-2 rounded-sm"></div>
        
        {/* Home Button */}
        <button 
          onClick={() => { onGoHome(); onClose(); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
            !selectedSubjectId 
              ? 'bg-school-board/10 text-school-board font-bold border-2 border-school-board/20 shadow-sm' 
              : 'text-school-graphite hover:bg-school-board/5 border-2 border-transparent'
          }`}
        >
          {!selectedSubjectId && (
            <div className="absolute left-1 rtl:right-1 rtl:left-auto top-1/2 -translate-y-1/2 text-school-board">
              <HandArrow className="w-3.5 h-3.5 transform rotate-180 rtl:rotate-0" />
            </div>
          )}

          <Home size={18} className={`relative z-10 ${!selectedSubjectId ? 'ml-3 rtl:mr-3 rtl:ml-0' : ''}`} />
          <span className="font-hand text-base relative z-10">{t('dashboard')}</span>
        </button>
      </div>

      {/* Divider - Dashed notebook line */}
      <div className="mx-8 border-t-2 border-dashed border-school-blue/20 mb-2"></div>

      {/* Subjects List */}
      <div className="flex-1 overflow-y-auto py-2 pl-12 pr-3 rtl:pr-12 rtl:pl-3 custom-scrollbar space-y-1">
        <h3 className="px-2 text-[10px] font-hand font-bold text-school-graphite/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Bookmark size={10} className="text-school-board/50" />
          {t('your_subjects')}
        </h3>
        
        {subjects.map((subject) => {
          const Icon = ICON_MAP[subject.icon] || ICON_MAP.default;
          const isSelected = selectedSubjectId === subject.id;
          
          return (
            <button
              key={subject.id}
              onClick={() => { onSelectSubject(subject.id); onClose(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 group relative ${
                isSelected 
                  ? 'bg-school-board/10 text-school-board font-bold border border-school-board/20' 
                  : 'text-school-graphite/70 hover:text-school-board hover:bg-school-board/5 border border-transparent'
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 rtl:right-0 rtl:left-auto top-1/2 -translate-y-1/2 text-school-board">
                   <HandArrow className="w-3.5 h-3.5 transform rotate-180 rtl:rotate-0" />
                </div>
              )}
              
              <Icon size={16} className={`transition-transform group-hover:scale-110 ${isSelected ? 'text-school-board' : 'text-school-graphite/50'}`} />
              <span className="font-hand text-sm truncate">{subject.name}</span>
            </button>
          );
        })}

        {/* Add Subject - Pencil style button */}
        <button 
          onClick={() => { onAddSubject(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 mt-3 text-school-graphite/50 hover:text-school-board rounded-lg transition-all group border-2 border-dashed border-school-pencil/40 hover:border-school-board/40 hover:bg-school-board/5"
        >
          <div className="w-6 h-6 rounded-full bg-school-pencil/20 group-hover:bg-school-pencil group-hover:text-school-graphite flex items-center justify-center transition-colors text-school-graphite/50">
            <Plus size={14} strokeWidth={3} />
          </div>
          <span className="font-hand font-bold text-sm">{t('add_subject')}</span>
        </button>
      </div>

      {/* Footer - Notebook bottom */}
      <div className="p-4 pl-12 rtl:pr-12 rtl:pl-4 border-t-2 border-dashed border-school-blue/20 bg-school-paper">
        <div className="flex items-center justify-between gap-2">
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-2 text-school-graphite/50 hover:text-school-board transition-colors group"
             title={t('switch_language')}
           >
             <Languages size={16} className="group-hover:scale-110 transition-transform" />
             <span className="font-hand text-xs font-bold">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
           </button>
           
           <button className="text-school-graphite/40 hover:text-school-board transition-colors hover:rotate-90 duration-300">
             <Settings size={16} />
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
              className="fixed inset-0 bg-school-graphite/40 backdrop-blur-sm z-40 md:hidden"
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
