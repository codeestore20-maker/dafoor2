import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Book, Calculator, FlaskConical, Globe, Languages, Music, Palette, Laptop, Layout, 
  Plus, Home, Menu, X
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subjectService } from '../../lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreateSubjectModal } from '../dashboard/CreateSubjectModal';
import { ScrapbookDashboard } from './ScrapbookDashboard';
import { ScrapbookSubjectView } from './ScrapbookSubjectView';

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

  // State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(searchParams.get('subjectId'));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Queries
  const { data: subjects = [] } = useQuery({
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

  return (
    <div className={`h-screen w-full overflow-hidden flex flex-col relative font-hand text-stone-800 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'} style={bgStyle}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[url('https://www.transparenttextures.com/patterns/washi.png')] bg-repeat-x opacity-50 z-50"></div>
      
      {/* Subtle overlay texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <CoffeeStain className="bottom-[-50px] right-[-50px] opacity-20" />
      <CoffeeStain className="top-[20%] left-[10%] w-24 h-24 border-4 opacity-10" />

      
      {/* Top Navigation Bar (Hand-drawn style) */}
      <header className="px-4 py-2 flex justify-between items-center relative z-40 bg-white/80 backdrop-blur-md border-b border-stone-800/5 mx-2 md:mx-4 mt-2 md:mt-4 rounded-xl shadow-sm">
         <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200 text-stone-600 active:scale-95 transition-all"
            >
                <Menu size={20} />
            </button>

            <div className="w-10 h-10 bg-school-board text-white rounded-lg flex items-center justify-center transform -rotate-3 shadow-md border-2 border-stone-800 hidden md:flex">
               <span className="text-2xl">✏️</span>
            </div>
            <h1 className="font-bold tracking-tight text-stone-800 flex items-center gap-1" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
              {t('app_name')}
              <span className="text-school-pencil text-3xl leading-none">.</span>
            </h1>
         </div>

         <div className="flex items-center gap-4">
             <button 
                onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}
                className="font-bold px-3 py-1 bg-yellow-100 border-2 border-yellow-400 rounded-full hover:bg-yellow-200 transition-colors transform hover:rotate-2"
                style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
             >
               {isRtl ? 'English' : 'العربية'}
             </button>
             <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-stone-800 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=Student`} alt="Avatar" />
             </div>
         </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-0 md:p-6 gap-0 md:gap-8 relative z-30">
        
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 md:hidden"
                />
            )}
        </AnimatePresence>

        {/* Left: Creative Sidebar (Washi Tape Tabs) */}
        <nav className={`
            fixed md:relative ${isRtl ? 'right-0' : 'left-0'} z-[60] md:z-auto
            w-[65vw] max-w-[280px] md:w-64 flex flex-col gap-3 shrink-0 
            ${isRtl ? 'border-l' : 'border-r'} md:border-none
            bg-[#fffdf5] md:bg-transparent shadow-2xl md:shadow-none
            p-4 md:p-0 pt-0 md:pt-0
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} md:translate-x-0
            top-[64px] md:top-0 h-[calc(100vh-64px)] md:h-auto rounded-none
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
           </div>
        </nav>

        {/* Center: The Notebook / Workspace */}
        <main className="flex-1 relative perspective-1000 h-full overflow-hidden">
          <AnimatePresence mode="wait">
             {selectedSubjectId && selectedSubject ? (
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
        </main>
      </div>

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
