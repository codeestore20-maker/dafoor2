import React from 'react';
import { Home, Settings, Plus, LayoutGrid, BookOpen, Languages, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface PlannerTabsProps {
  subjects: any[];
  selectedSubjectId: string | null;
  onSelectSubject: (id: string) => void;
  onGoHome: () => void;
  onAddSubject: () => void;
}

export function PlannerTabs({ 
  subjects, 
  selectedSubjectId, 
  onSelectSubject, 
  onGoHome,
  onAddSubject
}: PlannerTabsProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex flex-col h-full w-full bg-school-board text-white relative z-20 overflow-hidden shadow-2xl rounded-r-3xl rtl:rounded-r-none rtl:rounded-l-3xl md:rounded-3xl border-r-4 rtl:border-r-0 rtl:border-l-4 md:border-4 border-stone-800/20">
      
      {/* Chalkboard Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`
      }}></div>

      {/* Header / Logo */}
      <div className="p-6 pb-4 relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
           <span className="text-2xl">🎓</span>
        </div>
        <div>
          <h1 className="font-hand text-2xl font-bold text-white leading-none tracking-wide text-shadow-sm">
            {t('app_name')}
          </h1>
          <span className="text-[10px] text-white/60 font-mono uppercase tracking-widest">v2.0</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 relative z-10 custom-scrollbar-light">
        
        <SidebarItem 
          icon={<LayoutGrid size={20} />} 
          label={t('dashboard')} 
          isActive={!selectedSubjectId}
          onClick={onGoHome}
        />

        <div className="px-3 py-2 mt-4 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('your_subjects')}</span>
          <button onClick={onAddSubject} className="text-white/40 hover:text-white transition-colors">
            <Plus size={16} />
          </button>
        </div>

        {subjects.map((subject) => (
          <SidebarItem
            key={subject.id}
            icon={<BookOpen size={20} />}
            label={subject.name}
            isActive={selectedSubjectId === subject.id}
            onClick={() => onSelectSubject(subject.id)}
            color={subject.color}
          />
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddSubject}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:border-white/40 hover:text-white transition-all font-hand font-bold text-sm mt-2"
        >
          <Plus size={20} />
          <span>{t('add_subject')}</span>
        </motion.button>

      </div>

      {/* Bottom Actions */}
      <div className="p-4 relative z-10 border-t border-white/10 space-y-2 bg-black/10">
        
        {/* Language Toggle */}
        <SidebarItem 
          icon={<Languages size={20} />} 
          label={isRtl ? 'English' : 'العربية'} 
          isActive={false}
          onClick={toggleLanguage}
          variant="secondary"
        />

        <SidebarItem 
          icon={<Settings size={20} />} 
          label={t('settings')} 
          isActive={false}
          onClick={() => {}}
          variant="secondary"
        />
        
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  color?: string;
  variant?: 'primary' | 'secondary';
}

function SidebarItem({ icon, label, isActive, onClick, color, variant = 'primary' }: SidebarItemProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group
        ${isActive 
          ? 'bg-white text-school-board shadow-lg font-bold' 
          : 'text-white/80 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {/* Active Indicator Line */}
      {isActive && (
        <motion.div 
          layoutId="sidebarActive"
          className="absolute left-0 rtl:right-0 rtl:left-auto top-1/2 -translate-y-1/2 w-1 h-8 bg-school-pencil rounded-r-full rtl:rounded-l-full rtl:rounded-r-none"
        />
      )}

      {/* Icon Wrapper */}
      <div className={`
        relative z-10
        ${isActive ? 'text-school-board' : 'text-white/70 group-hover:text-white'}
      `}>
        {color ? (
          <div className={`w-5 h-5 rounded-full ${color} border-2 border-white/20 shadow-sm`}></div>
        ) : (
          icon
        )}
      </div>

      {/* Label */}
      <span className="font-hand text-sm md:text-base truncate relative z-10">
        {label}
      </span>

      {/* Chalk Effect on Hover */}
      {!isActive && (
        <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-5 transition-opacity"></div>
      )}
    </motion.button>
  );
}
