import React from 'react';
import { BookOpen, BrainCircuit, GraduationCap, PenTool, FileText, TrendingUp, BookA, AlertTriangle, Plus, ChevronLeft, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'notes' | 'summary' | 'predictor' | 'glossary' | 'flashcards' | 'quiz' | 'review' | 'notebooks';
interface StudySidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  fileName: string;
  onBack: () => void;
}
export function StudySidebar({
  currentView,
  onViewChange,
  fileName,
  onBack
}: StudySidebarProps) {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const NavItem = ({
    view,
    icon: Icon,
    label,
    badge
  }: {
    view: ViewMode;
    icon: any;
    label: string;
    badge?: string;
  }) => <button onClick={() => {
    onViewChange(view);
  }} className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-1 text-start group
        ${currentView === view ? 'bg-school-board text-white shadow-md' : 'text-stone-600 hover:bg-stone-200'}
      `}>
      <Icon size={18} className={currentView === view ? 'text-school-pencil' : 'text-stone-400 group-hover:text-stone-600'} />
      <span className={`font-hand font-bold text-lg ${currentView === view ? 'text-white' : ''}`}>
        {label}
      </span>
      {badge && <span className="ml-auto rtl:mr-auto rtl:ml-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-sans font-bold">
          {badge}
        </span>}
    </button>;
  return <div className="h-full bg-stone-100 border-r rtl:border-r-0 rtl:border-l border-stone-200 flex flex-col w-full">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 bg-stone-100">
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 hover:text-school-board transition-colors">
          <ChevronLeft size={14} className="flip-rtl" />
          {t('back_to_library')}
        </button>
        <div className="flex items-center gap-2 text-school-board">
          <FileText size={20} className="flex-shrink-0" />
          <h2 className="font-hand font-bold text-sm leading-tight line-clamp-2" title={fileName}>
            {fileName}
          </h2>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Section 1: AI Learning */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-3 font-hand">
            {t('ai_learning')}
          </h3>
          <NavItem view="summary" icon={BookOpen} label={t('deep_summary')} />
          <NavItem view="notes" icon={PenTool} label={t('smart_notes')} />
          <NavItem view="predictor" icon={TrendingUp} label={t('exam_predictor')} badge={t('new_badge')} />
          <NavItem view="glossary" icon={BookA} label={t('live_glossary')} />
        </div>

        {/* Section 2: Study Space */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-3 font-hand">
            {t('study_space')}
          </h3>
          <NavItem view="flashcards" icon={BrainCircuit} label={t('flashcards')} />
          <NavItem view="quiz" icon={GraduationCap} label={t('quizzes')} />
          <NavItem view="review" icon={AlertTriangle} label={t('focus_review')} />
        </div>

        {/* Section 3: Notebooks */}
        <div>
          <div className="flex items-center justify-between px-3 mb-3">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-hand">
              {t('notebooks')}
            </h3>
            <button onClick={() => onViewChange('notebooks')} className="p-1 hover:bg-stone-200 rounded text-stone-500 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <NavItem view="notebooks" icon={FileText} label={t('my_notebook')} />

          <div className="mt-2 pl-3 rtl:pl-0 rtl:pr-3 space-y-2">
            <button className="flex items-center gap-2 text-stone-500 hover:text-school-board transition-colors text-sm font-hand">
              <div className="w-1.5 h-1.5 rounded-full bg-school-pencil"></div>
              <span>Biology Draft 1</span>
            </button>
            <button className="flex items-center gap-2 text-stone-500 hover:text-school-board transition-colors text-sm font-hand">
              <div className="w-1.5 h-1.5 rounded-full bg-school-blue"></div>
              <span>Lab Ideas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
         {/* Language Switcher (Mini) */}
         <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-white border border-stone-200 transition-colors text-xs font-bold text-stone-600 font-hand"
        >
            <div className="flex items-center gap-2">
                <Languages size={14} />
                <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
            </div>
        </button>

        <div className="flex items-center justify-between mb-2">
          <span className="font-hand font-bold text-stone-600">{t('level')} 5</span>
          <span className="font-hand font-bold text-school-board">450 XP</span>
        </div>
        <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full bg-school-pencil w-2/3 rounded-full"></div>
        </div>
      </div>
    </div>;
}
