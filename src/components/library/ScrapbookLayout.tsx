import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Book, Calculator, FlaskConical, Globe, Languages, Music, Palette, Laptop, Layout, 
  Plus, Home, Menu, X, User, Settings, LogOut, HelpCircle, ChevronDown, LayoutGrid, ChevronLeft
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subjectService } from '../../lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreateSubjectModal } from '../dashboard/CreateSubjectModal';
import { ScrapbookDashboard } from './ScrapbookDashboard';
import { ScrapbookSubjectView } from './ScrapbookSubjectView';
import { SidebarSkeleton, DashboardSkeleton } from './ScrapbookSkeleton';
import { useAuth } from '../../context/AuthContext';

// --- Doodles & Decorations ---
const CoffeeStain = ({ className }: { className?: string }) => (
  <div className={`absolute w-32 h-32 rounded-full border-4 border-[#5D4037] opacity-10 pointer-events-none z-0 mix-blend-multiply filter blur-[1px] ${className}`}></div>
);

const Tape = ({ className, color = 'bg-yellow-200' }: any) => (
  <div className={`absolute h-6 w-24 ${color} opacity-90 shadow-sm z-20 pointer-events-none mix-blend-multiply ${className}`} 
       style={{ clipPath: 'polygon(2% 0%, 98% 1%, 100% 98%, 0% 100%)' }}></div>
);

const SpiralBinding = ({ side = 'left' }: { side?: 'left' | 'right' }) => (
  <div className={`absolute ${side === 'left' ? '-left-4 md:-left-5' : '-right-4 md:-right-5'} top-0 bottom-0 w-6 flex flex-col justify-evenly py-2 z-20 pointer-events-none h-full overflow-hidden`}>
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className={`w-full h-1.5 bg-stone-300 ${side === 'left' ? 'rounded-r-full' : 'rounded-l-full'} shadow-sm border border-stone-400 relative transform ${side === 'left' ? '-rotate-6' : 'rotate-6'}`}>
      </div>
    ))}
  </div>
);


// --- Icons Map ---
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

// --- Folder Colors ---
const FOLDER_COLORS = [
  'bg-amber-200',
  'bg-orange-200',
  'bg-yellow-200',
  'bg-lime-200', 
  'bg-amber-100',
  'bg-orange-100',
];

import { OnboardingProvider } from '../../context/OnboardingContext';

// --- Mobile Components ---

const MobileTabBar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
    const tabs = [
        { id: 'dashboard', icon: Home, label: 'الرئيسية' },
        { id: 'subjects', icon: LayoutGrid, label: 'المواد' },
        { id: 'profile', icon: User, label: 'حسابي' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe z-[100] md:hidden px-4 py-2">
            <div className="flex items-center justify-around">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-stone-900 scale-105' : 'text-stone-400'}`}
                        >
                            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-yellow-100' : 'bg-transparent'}`}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold ${isActive ? 'font-hand' : 'font-sans'}`}>
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

const MobileHeader = ({ title, showBack, onBack, user }: { title: string, showBack?: boolean, onBack?: () => void, user?: any }) => (
    <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-stone-200 z-[100] md:hidden h-[70px] px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            {showBack ? (
                <button onClick={onBack} className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full active:bg-stone-200 transition-colors">
                    <ChevronLeft size={24} className="rtl:rotate-180" />
                </button>
            ) : (
                <div className="w-[60px] h-[60px] min-w-[60px] min-h-[60px] flex items-center justify-center">
                    <img src="/favicon.png" alt="Dafoor Ai" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
            )}
            <h1 className="font-bold text-lg text-stone-800 font-hand truncate max-w-[200px]">{title}</h1>
        </div>
        
        {!showBack && user && (
            <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="w-full h-full object-cover" />
            </div>
        )}
    </div>
);

// --- Main Layout Component ---
export function ScrapbookLayout() {
  return (
    <OnboardingProvider>
      <ScrapbookLayoutContent />
    </OnboardingProvider>
  );
}

function ScrapbookLayoutContent() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRtl = i18n.language === 'ar';
  const { user, logout } = useAuth();
  
  // State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(searchParams.get('subjectId'));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Queries
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll
  });

  // Effects
  useEffect(() => {
    const id = searchParams.get('subjectId');
    if (id && id !== selectedSubjectId) setSelectedSubjectId(id);
  }, [searchParams]);

  const handleSelectSubject = (id: string | null) => {
    setSelectedSubjectId(id);
    if (id) setSearchParams({ subjectId: id });
    else setSearchParams({});
  };

  const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);

  // Background Style (Dot Grid / Cute Notebook)
  const bgStyle = {
    backgroundColor: '#fffdf5', // Cream/Warm white
    backgroundImage: `
      radial-gradient(#e5e7eb 2px, transparent 2px)
    `,
    backgroundSize: '24px 24px',
  };
  
  // Mobile View Logic
  const renderMobileContent = () => {
      // 1. If a subject is selected, show Subject View (Full Screen)
      if (selectedSubjectId && selectedSubject) {
          return (
             <ScrapbookSubjectView 
                key={selectedSubjectId} 
                subject={selectedSubject} 
                viewMode={viewMode}
                setViewMode={setViewMode}
                onBack={() => handleSelectSubject(null)}
             />
          );
      }

      // 2. Tab Views
      if (activeMobileTab === 'profile') {
          return (
              <div className="p-4 space-y-6 pb-20">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center">
                       <div className="w-24 h-24 mx-auto bg-stone-100 rounded-full mb-4 overflow-hidden border-4 border-white shadow-sm">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="User" className="w-full h-full object-cover" />
                       </div>
                       <h2 className="text-xl font-bold font-hand text-stone-800">{user?.name}</h2>
                       <p className="text-stone-500 text-sm font-mono">{user?.email}</p>
                  </div>

                  <div className="space-y-2">
                       <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider px-2">الإعدادات</h3>
                       <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                           <button className="w-full p-4 flex items-center gap-3 hover:bg-stone-50 transition-colors text-right border-b border-stone-100">
                               <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><User size={16} /></div>
                               <span className="font-bold font-hand text-stone-700 flex-1">تعديل الملف الشخصي</span>
                               <ChevronLeft size={16} className="text-stone-300 rtl:rotate-180" />
                           </button>
                           <button className="w-full p-4 flex items-center gap-3 hover:bg-stone-50 transition-colors text-right border-b border-stone-100">
                               <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center"><Settings size={16} /></div>
                               <span className="font-bold font-hand text-stone-700 flex-1">التفضيلات</span>
                               <ChevronLeft size={16} className="text-stone-300 rtl:rotate-180" />
                           </button>
                           <button 
                                onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}
                                className="w-full p-4 flex items-center gap-3 hover:bg-stone-50 transition-colors text-right"
                           >
                               <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><Languages size={16} /></div>
                               <span className="font-bold font-hand text-stone-700 flex-1">{isRtl ? 'English Language' : 'اللغة العربية'}</span>
                               <ChevronLeft size={16} className="text-stone-300 rtl:rotate-180" />
                           </button>
                       </div>
                  </div>

                  <button 
                    onClick={logout}
                    className="w-full p-4 rounded-xl bg-red-50 text-red-500 font-bold font-hand border border-red-100 flex items-center justify-center gap-2"
                  >
                      <LogOut size={18} />
                      تسجيل الخروج
                  </button>
              </div>
          );
      }

      if (activeMobileTab === 'subjects') {
          return (
              <div className="p-4 pb-24 grid grid-cols-2 gap-4">
                  {subjects.map((subject: any, index: number) => {
                      const SubjectIcon = ICON_MAP[subject.icon] || ICON_MAP.default;
                      const isDefaultColor = !subject.color || subject.color === 'bg-blue-200' || subject.color.includes('gray');
                      const hash = subject.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                      const color = isDefaultColor ? FOLDER_COLORS[hash % FOLDER_COLORS.length] : subject.color;

                      return (
                          <button 
                            key={subject.id}
                            onClick={() => handleSelectSubject(subject.id)}
                            className={`aspect-square rounded-2xl ${color} p-4 flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform border-2 border-stone-800/5 relative overflow-hidden`}
                          >
                              <div className="absolute inset-0 bg-white/20"></div>
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm relative z-10">
                                  <SubjectIcon size={24} className="text-stone-700" />
                              </div>
                              <span className="font-bold font-hand text-stone-800 text-center relative z-10">{subject.name}</span>
                          </button>
                      )
                  })}
                  
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="aspect-square rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 p-4 flex flex-col items-center justify-center gap-3 text-stone-400 active:scale-95 transition-transform"
                  >
                      <Plus size={32} />
                      <span className="font-bold font-hand text-sm">مادة جديدة</span>
                  </button>
              </div>
          );
      }

      // Default: Dashboard
      return (
         <ScrapbookDashboard 
            key="dashboard" 
            subjects={subjects}
            onSelectSubject={handleSelectSubject}
            onAddSubject={() => setIsCreateModalOpen(true)}
         />
      );
  };

  return (
    <div className={`h-screen supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden flex flex-col relative font-hand text-stone-800 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'} style={bgStyle}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 opacity-50 z-50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #00000010 0, #00000010 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
      
      {/* Subtle overlay texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <CoffeeStain className="bottom-[-50px] right-[-50px] opacity-20" />
      <CoffeeStain className="top-[20%] left-[10%] w-24 h-24 border-4 opacity-10" />

      {/* Mobile Header */}
      <MobileHeader 
        title={selectedSubject ? selectedSubject.name : (activeMobileTab === 'subjects' ? t('subjects') : (activeMobileTab === 'profile' ? (user?.name || t('profile')) : t('app_name')))}
        showBack={!!selectedSubject}
        onBack={() => handleSelectSubject(null)}
        user={user}
      />
      
      {/* Top Navigation Bar (Hand-drawn style) */}
      <header className="hidden md:flex px-4 py-2 justify-between items-center relative z-40 bg-white/80 backdrop-blur-md border-b border-stone-800/5 mx-2 md:mx-4 mt-2 md:mt-4 rounded-xl shadow-sm">
         <div className="flex items-center gap-3">
            {/* Mobile Menu Button - Visible until XL */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden w-9 h-9 -mt-1 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200 text-stone-600 active:scale-95 transition-all"
            >
                <Menu size={18} />
            </button>

            <div className="w-14 h-14 flex items-center justify-center hidden md:flex">
               <img src="/favicon.png" alt="Dafoor Ai" className="w-full h-full object-contain drop-shadow-md transform scale-125" />
            </div>
            <h1 className="font-bold tracking-tight text-stone-800 flex items-center gap-1" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
              {t('app_name')}
              <span className="text-school-pencil text-3xl leading-none">.</span>
            </h1>
         </div>

         <div className="flex items-center gap-4">
             {/* Profile Dropdown */}
             <div className="relative z-50" ref={dropdownRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center gap-2 group outline-none"
                >
                   {/* Language Pill (Integrated) */}
                   <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        i18n.changeLanguage(isRtl ? 'en' : 'ar');
                      }}
                      className="hidden md:block font-bold px-3 py-1 bg-yellow-100 border-2 border-yellow-400 rounded-full hover:bg-yellow-200 transition-colors transform hover:rotate-2 cursor-pointer"
                      style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                   >
                     {isRtl ? 'English' : 'العربية'}
                   </div>

                   <div className={`w-10 h-10 rounded-full bg-stone-200 border-2 border-stone-800 overflow-hidden flex items-center justify-center transition-all ${isDropdownOpen ? 'ring-2 ring-yellow-400 ring-offset-2' : 'group-hover:scale-105'}`}>
                      {user?.name ? (
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-stone-500" />
                      )}
                   </div>
                   <ChevronDown size={16} className={`text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-3 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2 border-stone-800 overflow-hidden z-[100]"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b-2 border-stone-100 bg-[#fffdf5]">
                        <p className="font-bold text-stone-800 font-hand text-lg">{user?.name || 'Student'}</p>
                        <p className="text-xs text-stone-500 font-mono">{user?.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                         <button className="w-full text-left rtl:text-right px-3 py-2.5 rounded-lg hover:bg-stone-50 text-stone-700 font-bold font-hand text-sm flex items-center gap-3 transition-colors">
                            <User size={18} className="text-stone-400" />
                            {t('profile')}
                         </button>
                         <button className="w-full text-left rtl:text-right px-3 py-2.5 rounded-lg hover:bg-stone-50 text-stone-700 font-bold font-hand text-sm flex items-center gap-3 transition-colors">
                            <Settings size={18} className="text-stone-400" />
                            {t('settings')}
                         </button>
                         
                         {/* Mobile Language Toggle inside menu */}
                         <button 
                            onClick={() => {
                              i18n.changeLanguage(isRtl ? 'en' : 'ar');
                              setIsDropdownOpen(false);
                            }}
                            className="md:hidden w-full text-left rtl:text-right px-3 py-2.5 rounded-lg hover:bg-stone-50 text-stone-700 font-bold font-hand text-sm flex items-center gap-3 transition-colors"
                         >
                            <Languages size={18} className="text-stone-400" />
                            <span>{isRtl ? 'Switch to English' : 'تغيير للعربية'}</span>
                         </button>
                      </div>

                      <div className="h-0.5 bg-stone-100 mx-2 border-t border-dashed border-stone-300"></div>

                      <div className="p-2">
                         <button className="w-full text-left rtl:text-right px-3 py-2.5 rounded-lg hover:bg-stone-50 text-stone-700 font-bold font-hand text-sm flex items-center gap-3 transition-colors">
                            <HelpCircle size={18} className="text-stone-400" />
                            {t('help')}
                         </button>
                         <button 
                            onClick={logout}
                            className="w-full text-left rtl:text-right px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 font-bold font-hand text-sm flex items-center gap-3 transition-colors"
                         >
                            <LogOut size={18} className="text-red-400" />
                            {t('log_out')}
                         </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
         </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-0 md:p-6 gap-0 md:gap-8 relative z-30 pt-14 md:pt-0">
        
        {/* --- DESKTOP Sidebar --- */}
        <nav className={`
            hidden md:flex 
            ${isRtl ? 'right-0' : 'left-0'} z-[60] xl:z-auto
            w-[65vw] max-w-[280px] xl:w-64 flex-col gap-3 shrink-0 
            ${isRtl ? 'border-l' : 'border-r'} xl:border-none
            bg-[#fffdf5] xl:bg-transparent shadow-2xl xl:shadow-none
            p-4 xl:p-0 pt-0 xl:pt-0
            top-[64px] xl:top-0 h-[calc(100vh-64px)] xl:h-auto rounded-none
        `}>
           {/* Close Button for Mobile - Removed as clicking outside or menu button toggles it */}
           
           {/* Spiral Binding Visual (Adjusted for mobile drawer) */}
           <div>
                <SpiralBinding side={isRtl ? 'right' : 'left'} />
           </div>
           
           {/* Home / Dashboard Tab */}
           <NavTab 
             label={t('dashboard')} 
             icon={<Home size={20} />} 
             isActive={!selectedSubjectId} 
             color="bg-pink-200"
             borderColor="border-pink-400"
             onClick={() => {
                 handleSelectSubject(null);
                 setIsMobileMenuOpen(false);
             }}
           />

           <div className="flex-1 overflow-y-auto px-1 custom-scrollbar space-y-2 pt-2 pb-20">
              {isLoading ? (
                <SidebarSkeleton />
              ) : (
                <>
                  <div className="px-1">
                     <h3 className="font-bold text-stone-500 uppercase tracking-widest mb-2 transform rotate-1 flex items-center gap-2" style={{ fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)' }}>
                        {t('your_subjects')}
                        <div className="h-px bg-stone-300 flex-1 opacity-50"></div>
                     </h3>
                  </div>
                  
                  {subjects.map((subject: any, index: number) => {
                     // Color logic
                     const isDefaultColor = !subject.color || subject.color === 'bg-blue-200' || subject.color.includes('gray');
                     const hash = subject.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                     const subjectColor = isDefaultColor ? FOLDER_COLORS[hash % FOLDER_COLORS.length] : subject.color;
    
                     return (
                     <NavTab
                       key={subject.id}
                       label={subject.name}
                       icon={React.createElement(ICON_MAP[subject.icon] || ICON_MAP.default, { size: 18 })}
                       isActive={selectedSubjectId === subject.id}
                       color={subjectColor}
                       borderColor={subjectColor.replace('200', '400').replace('100', '300')}
                       onClick={() => {
                           handleSelectSubject(subject.id);
                           setIsMobileMenuOpen(false);
                       }}
                       rotate={index % 2 === 0 ? 1 : -1}
                     />
                  )})}
    
                  <button 
                    onClick={() => {
                        setIsCreateModalOpen(true);
                        setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center gap-2 text-stone-400 hover:text-stone-600 hover:border-stone-400 hover:bg-white/50 transition-all group"
                  >
                     <div className="w-6 h-6 rounded-full bg-stone-200 group-hover:bg-school-board group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus size={14} />
                     </div>
                     <span className="font-bold" style={{ fontSize: 'clamp(0.8rem, 1vw, 0.875rem)' }}>{t('add_subject')}</span>
                  </button>
                </>
              )}
           </div>
        </nav>

        {/* Center: The Notebook / Workspace */}
        <main className="flex-1 relative perspective-1000 h-full overflow-hidden">
          {/* Mobile Content Render */}
          <div className="md:hidden h-full overflow-y-auto custom-scrollbar">
               {isLoading ? <DashboardSkeleton /> : renderMobileContent()}
          </div>

          {/* Desktop Content Render (Existing) */}
          <div className="hidden md:block h-full">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
                        <DashboardSkeleton />
                    </motion.div>
                ) : selectedSubjectId && selectedSubject ? (
                    <ScrapbookSubjectView 
                    key={selectedSubjectId} 
                    subject={selectedSubject} 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onBack={() => handleSelectSubject(null)}
                    />
                ) : (
                    <ScrapbookDashboard 
                    key="dashboard" 
                    subjects={subjects}
                    onSelectSubject={handleSelectSubject}
                    onAddSubject={() => setIsCreateModalOpen(true)}
                    />
                )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* --- MOBILE Tab Bar --- */}
      {!selectedSubjectId && (
        <MobileTabBar 
            activeTab={activeMobileTab}
            onTabChange={setActiveMobileTab}
        />
      )}

      <CreateSubjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => {
            subjectService.create(data).then(() => {
                queryClient.invalidateQueries({ queryKey: ['subjects'] });
                setIsCreateModalOpen(false);
            });
        }}
      />
    </div>
  );
}

// --- Components ---

function NavTab({ label, icon, isActive, onClick, color = 'bg-white', borderColor = 'border-stone-200', rotate = 0 }: any) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ x: isActive ? 0 : 3, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            animate={{ 
                x: isActive ? (document.dir === 'rtl' ? -8 : 8) : 0,
                backgroundColor: isActive ? 'var(--active-bg)' : 'var(--inactive-bg)'
            }}
            className={`
                w-full flex items-center gap-2 md:gap-3 px-2 py-2 md:px-3 md:py-2.5
                rounded-lg md:rounded-xl shadow-sm border
                transition-all relative overflow-visible group
                ${isActive ? 'font-bold text-stone-900 z-10 shadow-md ring-1 ring-stone-800/5' : 'text-stone-600 hover:text-stone-900'}
            `}
            style={{ 
                transform: `rotate(${isActive ? 0 : rotate}deg)`,
                backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                borderColor: isActive ? '#292524' : 'transparent',
                ['--active-bg' as any]: 'white',
                ['--inactive-bg' as any]: 'rgba(255,255,255,0.7)'
            }}
        >
            {/* Color Tag / Tape */}
            <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md ${color} ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}></div>
            
            {/* Sticker Icon Container */}
            <div className={`
                relative z-10 p-1.5 rounded-md border shadow-sm transition-all duration-300
                ${isActive ? 'bg-yellow-50 border-stone-800 rotate-2 scale-105' : 'bg-white border-stone-200 group-hover:border-stone-400 group-hover:rotate-3'}
            `}>
                <div className={isActive ? 'text-stone-900' : 'text-stone-500'}>
                    {icon}
                </div>
            </div>

            {/* Label with Highlighter effect */}
            <div className="relative z-10 flex-1 text-left rtl:text-right overflow-hidden min-w-0">
                <span className={`
                    block truncate relative z-10 font-hand font-bold tracking-wide
                    ${isActive ? 'text-stone-900' : 'text-stone-600'}
                `}
                style={{ fontSize: 'clamp(0.8rem, 1.2vw, 1rem)' }}
                >
                    {label}
                </span>
                {isActive && (
                    <div className="absolute bottom-1 left-0 w-full h-2 bg-yellow-200/60 -z-10 transform -skew-x-6 rounded-sm"></div>
                )}
            </div>
            
            {/* Decorative Tape for active item */}
            {isActive && (
                <Tape className="-top-2 -right-1 rotate-[20deg] bg-pink-300/60 w-12 !h-4" />
            )}
        </motion.button>
    );
}
