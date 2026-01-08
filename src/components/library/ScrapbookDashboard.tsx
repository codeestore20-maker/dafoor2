import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Book, Calculator, FlaskConical, Globe, Languages, Music, Palette, Laptop, Layout, 
  Plus, Star, Heart, Zap, Coffee, Smile, PenTool, Clock, CheckCircle2, TrendingUp,
  Quote, Calendar, ArrowRight, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recentFilesService } from '../../lib/recentFiles';
import { useOnboarding } from '../../context/OnboardingContext';

// --- Decorative Elements ---
const Tape = ({ className, color = 'bg-yellow-200' }: { className?: string, color?: string }) => (
  <div className={`absolute h-8 w-32 ${color} opacity-90 shadow-sm z-20 pointer-events-none mix-blend-multiply ${className}`} 
       style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 98%, 0% 100%)' }}></div>
);

const Sticker = ({ icon: Icon, className, color = 'text-yellow-500', bg = 'bg-white' }: any) => (
  <div className={`absolute w-12 h-12 ${bg} rounded-full border-2 border-white shadow-md flex items-center justify-center transform rotate-12 z-10 ${className}`}>
    <Icon size={24} className={color} />
  </div>
);

const SpiralBinding = () => (
  <div className="absolute left-0 top-2 bottom-2 w-6 flex flex-col justify-evenly py-1 z-20">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="w-full h-3 bg-stone-300 rounded-r-full shadow-inner border-t border-b border-stone-400 relative mb-2">
        <div className="absolute left-1 top-0.5 w-1.5 h-1.5 bg-stone-800 rounded-full opacity-20"></div>
      </div>
    ))}
  </div>
);

const PaperTexture = () => (
    <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" 
         style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cardboard.png")` }}>
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

// --- Folder Colors for "Folder-like" look ---
const FOLDER_COLORS = [
  'bg-amber-200',
  'bg-orange-200',
  'bg-yellow-200',
  'bg-lime-200', 
  'bg-amber-100',
  'bg-orange-100',
];

// --- Widgets ---

const StatsWidget = ({ t }: { t: any }) => {
    const stats = [
        { label: t('study_hours'), value: '12.5', icon: Clock, bg: 'bg-yellow-100', rotate: '-rotate-2' },
        { label: t('completed_tasks'), value: '8', icon: CheckCircle2, bg: 'bg-green-100', rotate: 'rotate-1' },
        { label: t('streak_days'), value: '5', icon: TrendingUp, bg: 'bg-blue-100', rotate: '-rotate-1' },
    ];

    return (
        <div className="grid grid-cols-3 gap-1.5 md:gap-4 mb-6 md:mb-8 w-full max-w-full">
            {stats.map((stat, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className={`
                        w-full p-0.5 md:p-4 rounded-lg md:rounded-xl shadow-sm md:shadow-md border border-stone-800/5 
                        ${stat.bg} ${stat.rotate} flex flex-col items-center justify-center gap-0 md:gap-2 relative group min-h-[110px] md:min-h-[120px] overflow-hidden
                    `}
                >
                    <div className="absolute -top-1.5 md:-top-3 left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm border border-stone-200 z-10">
                        <stat.icon size={12} className="text-stone-700 md:hidden" />
                        <stat.icon size={16} className="text-stone-700 hidden md:block" />
                    </div>
                    <span className="font-bold text-stone-800 font-hand mt-3 md:mt-2 relative z-0" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>{stat.value}</span>
                    <span className="font-bold text-stone-600 uppercase tracking-wide text-center leading-tight px-0.5" style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.9rem)' }}>{stat.label}</span>
                    <div className="absolute -top-1 md:-top-2 left-1/2 -translate-x-1/2 w-8 md:w-16 h-1.5 md:h-4 bg-red-300/50 -rotate-1"></div>
                </motion.div>
            ))}
        </div>
    );
};

const QuoteWidget = ({ t }: { t: any }) => (
    <motion.div 
        whileHover={{ rotate: 0, scale: 1.02 }}
        className="bg-[#fff9c4] p-4 md:p-6 rounded-sm shadow-md border-b-2 border-r-2 border-stone-300/50 relative max-w-sm rotate-1 transform transition-all mx-auto lg:mx-0 w-full"
    >
        {/* Washi Tape */}
        <div className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2 w-16 md:w-24 h-6 md:h-8 bg-rose-300/80 -rotate-1 shadow-sm opacity-90" style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 98%, 0% 100%)' }}></div>
        
        {/* Pin */}
        <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500 shadow-sm border border-red-600 z-10"></div>

        {/* Quote Icon */}
        <Quote size={20} className="text-stone-400/50 absolute top-4 md:top-6 left-2 md:left-4 transform -scale-x-100" />
        
        <div className="relative z-10 pt-2 md:pt-4">
            <p className="font-hand text-stone-800 text-center leading-relaxed mb-2 md:mb-3" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
                "{t('quote_text')}"
            </p>
            <div className="flex items-center justify-center gap-2">
                <div className="h-px w-6 md:w-8 bg-stone-400/50"></div>
                <p className="text-stone-600 font-bold uppercase tracking-wider" style={{ fontSize: 'clamp(0.6rem, 0.8vw, 0.75rem)' }}>{t('quote_author')}</p>
                <div className="h-px w-6 md:w-8 bg-stone-400/50"></div>
            </div>
        </div>

        {/* Doodles */}
        <div className="absolute bottom-1 right-2 opacity-60 transform rotate-12">
             <Star size={16} className="text-yellow-500 fill-yellow-200" />
        </div>
        <div className="absolute top-6 md:top-8 right-2 md:right-4 opacity-40 transform -rotate-12">
             <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-stone-800/20"></div>
        </div>
    </motion.div>
);

const RecentFilesWidget = ({ t }: { t: any }) => {
    const [recentFiles, setRecentFiles] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const files = recentFilesService.getFiles().slice(0, 5);
        setRecentFiles(files);
    }, []);

    if (recentFiles.length === 0) return null;

    return (
        <div className="mt-8 relative group perspective-1000">
             {/* Background Layers for "Stack of Papers" effect */}
             <div className="absolute inset-0 bg-[#fffdf0] rounded-sm shadow-md transform rotate-2 border border-stone-300"></div>
             <div className="absolute inset-0 bg-[#fffdf0] rounded-sm shadow-sm transform -rotate-1 border border-stone-300"></div>
             
             {/* Tape Element */}
             <Tape className="top-0 left-1/2 -translate-x-1/2 -mt-3 md:-mt-4 bg-rose-300/90 rotate-2 w-24 md:w-32 h-6 md:h-8" />

             {/* Main Content Area (Legal Pad style) */}
             <div className="relative z-10 p-4 md:p-6 bg-[#fffdf0] rounded-sm min-h-[200px] md:min-h-[250px] shadow-sm">
                 {/* Header */}
                 <div className="flex items-center justify-between mb-3 md:mb-4 border-b-2 border-stone-300 border-dashed pb-2">
                    <h3 className="font-bold text-stone-800 font-hand flex items-center gap-2" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
                        <FileText className="text-stone-600 transform -rotate-12" size={20} />
                        {t('recent_files')}
                    </h3>
                    <div className="font-mono text-stone-400 rotate-3" style={{ fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)' }}>
                        {new Date().toLocaleDateString()}
                    </div>
                 </div>

                 {/* Lined Paper Lines Background */}
                 <div className="absolute inset-0 top-16 md:top-20 pointer-events-none" 
                      style={{ backgroundImage: 'linear-gradient(#00000010 1px, transparent 1px)', backgroundSize: '100% 2rem' }}>
                 </div>
                 
                 {/* Red Margin Line */}
                 <div className="absolute top-0 bottom-0 left-6 md:left-8 w-px bg-red-300/50 z-0"></div>

                 {/* List */}
                 <ul className="relative z-10 space-y-1 md:space-y-2 pl-3 md:pl-4 pr-1 md:pr-2">
                    {recentFiles.map((file, i) => (
                        <motion.li 
                            key={file.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigate(`/app/study/${file.id}`)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className="
                                group/item cursor-pointer py-1.5 md:py-2 px-2 md:px-3 rounded-lg
                                border border-transparent hover:border-stone-400/20
                                hover:bg-white/60 hover:shadow-sm transition-all flex items-center gap-2 md:gap-3
                                relative overflow-hidden
                            "
                        >
                            {/* Highlighter Effect Background */}
                            <div className="absolute inset-0 bg-yellow-200/0 group-hover/item:bg-yellow-200/30 transition-colors duration-300 -z-10"></div>

                            {/* Bullet/Icon */}
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 group-hover/item:bg-white group-hover/item:border-stone-400 transition-colors">
                                <FileText size={12} className="text-stone-400 group-hover/item:text-stone-700 transition-colors" />
                            </div>
                            
                            {/* File Name */}
                            <div className="flex-1 min-w-0">
                                <span className="font-hand font-bold text-stone-700 truncate block group-hover/item:text-stone-900 transition-colors" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.125rem)' }}>
                                    {file.name}
                                </span>
                                <span className="uppercase tracking-wider text-stone-400 font-bold group-hover/item:text-stone-500" style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.625rem)' }}>
                                    {t('last_viewed')}
                                </span>
                            </div>

                            {/* Arrow */}
                            <ArrowRight size={14} className="text-stone-400 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all hidden md:block" />
                        </motion.li>
                    ))}
                 </ul>

                 {/* Doodle/Stamp at bottom */}
                 <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 opacity-10 transform -rotate-12 pointer-events-none">
                    <CheckCircle2 size={48} />
                 </div>
             </div>
        </div>
    );
};

// --- Main Component ---
export function ScrapbookDashboard({ subjects, onSelectSubject, onAddSubject }: any) {
    const { t } = useTranslation();
    const { currentStep, completeStep, skipTour } = useOnboarding();
    
    const handleAddSubject = () => {
        if (currentStep === 0) completeStep();
        onAddSubject();
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 pb-32"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Stats & Subjects (8 cols) */}
                <div className="lg:col-span-8">
                    {/* Header */}
                <div className="mb-8 flex items-end gap-4">
                    <div>
                        <h2 className="font-bold text-stone-800 font-hand tracking-tight leading-none" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
                            {t('welcome_back')}
                        </h2>
                        <p className="text-stone-500 font-hand italic mt-1" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)' }}>
                            {t('ready_to_learn')}
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                    <StatsWidget t={t} />

                    {/* Subjects Grid */}
                    <div className="mt-8">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-stone-800 font-hand relative inline-block" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
                                {t('your_subjects')}
                                <div className="absolute -bottom-1 left-0 w-full h-2 bg-yellow-200/50 -rotate-1"></div>
                            </h3>
                            
                            <button 
                                onClick={handleAddSubject}
                                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg font-bold shadow-lg hover:bg-stone-700 hover:-translate-y-0.5 transition-all"
                                style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                            >
                                <Plus size={16} />
                                {t('new_subject')}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 min-[450px]:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-2 md:gap-6 md:gap-8 relative">
                            {subjects.map((subject: any, i: number) => (
                                <NotebookCard 
                                    key={subject.id} 
                                    subject={subject} 
                                    index={i}
                                    onClick={() => onSelectSubject(subject.id)} 
                                />
                            ))}
                            
                            {/* "New Subject" Card */}
                            <div className="relative w-full">
                                <motion.button 
                                    onClick={handleAddSubject}
                                    whileHover={{ scale: 1.02, rotate: 1 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="
                                        w-full h-40 md:h-80 rounded-xl border-4 border-dashed border-stone-300 
                                        bg-stone-50 flex flex-col items-center justify-center gap-2 md:gap-3
                                        text-stone-400 hover:text-stone-600 hover:border-stone-400 hover:bg-white
                                        transition-all group relative overflow-hidden shadow-sm
                                    "
                                >
                                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-stone-200 group-hover:bg-yellow-100 transition-colors flex items-center justify-center">
                                        <Plus size={20} className="text-stone-400 group-hover:text-yellow-600 md:hidden" />
                                        <Plus size={32} className="text-stone-400 group-hover:text-yellow-600 hidden md:block" />
                                    </div>
                                    <span className="font-bold font-hand" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}>{t('create_new')}</span>
                                </motion.button>
                            </div>

                            {/* Empty State Guide Arrow */}
                            {subjects.length === 0 && currentStep > 0 && (
                                <div className="absolute top-1/2 -right-32 hidden xl:block transform -translate-y-1/2 rotate-12 pointer-events-none">
                                    <div className="flex flex-col items-center">
                                        <p className="font-hand text-2xl text-stone-600 mb-2 rotate-6">{t('start_here_arrow')}</p>
                                        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-stone-600 transform rotate-180">
                                            <path d="M50 10 C 30 20, 10 0, 5 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                                            <path d="M5 30 L 15 25 M 5 30 L 0 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-8 pt-4">
                    {/* Daily Quote */}
                    <div className="flex justify-center lg:justify-start">
                        <QuoteWidget t={t} />
                    </div>

                    {/* Recent Files */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 to-purple-300"></div>
                        <RecentFilesWidget t={t} />
                    </div>

                    {/* Decorative Image/Sticker */}
                    <div className="relative h-48 w-full flex items-center justify-center opacity-80">
                         <div className="absolute inset-0 bg-yellow-100/50 rounded-2xl transform rotate-3 border-2 border-stone-800/5 border-dashed"></div>
                         <div className="relative z-10 text-center p-4">
                            <Coffee size={48} className="text-stone-400 mx-auto mb-2" />
                            <p className="font-hand text-stone-500 font-bold" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>{t('quiet_here')}</p>
                         </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}

// --- Notebook Card Component ---
function NotebookCard({ subject, onClick, index }: any) {
    const SubjectIcon = ICON_MAP[subject.icon] || ICON_MAP.default;
    // Increased rotation for more playfulness
    const randomRotation = index % 2 === 0 ? 2 : -2; 
    const patterns = [
        "radial-gradient(#00000011 1px, transparent 1px)", // Dots
        "linear-gradient(0deg, transparent 24%, #00000008 25%, #00000008 26%, transparent 27%, transparent 74%, #00000008 75%, #00000008 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #00000008 25%, #00000008 26%, transparent 27%, transparent 74%, #00000008 75%, #00000008 76%, transparent 77%, transparent)", // Grid
        "repeating-linear-gradient(45deg, #00000005 0, #00000005 1px, transparent 0, transparent 50%)" // Stripes
    ];
    const selectedPattern = patterns[index % patterns.length];
    
    // Determine color logic
    const rawColor = subject.color || FOLDER_COLORS[index % FOLDER_COLORS.length];
    const isCustomColor = rawColor.startsWith('#') || rawColor.startsWith('rgb') || rawColor.startsWith('hsl');
    
    // Main Card Style
    const cardStyle = isCustomColor ? { backgroundColor: rawColor } : {};
    const cardClass = isCustomColor ? 'bg-opacity-100' : `${rawColor} !bg-opacity-100`; // Force solid opacity

    // Tab Color Logic
    // If tailwind class, try to shift shade. If custom color, use filter.
    const getDarkerShadeClass = (cls: string) => {
        if (!cls || isCustomColor) return '';
        // Simple heuristic for tailwind classes like 'bg-amber-200' -> 'bg-amber-300'
        if (cls.includes('-100')) return cls.replace('-100', '-200');
        if (cls.includes('-200')) return cls.replace('-200', '-300');
        if (cls.includes('-300')) return cls.replace('-300', '-400');
        return cls; // Fallback
    };
    
    const tabClass = isCustomColor ? '' : getDarkerShadeClass(rawColor);
    const tabStyle = isCustomColor ? { backgroundColor: rawColor, filter: 'brightness(0.9)' } : {};

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
                y: -12, 
                rotate: 0,
                scale: 1.05,
                transition: { duration: 0.2 }
            }}
            onClick={onClick}
            className="relative cursor-pointer group perspective-1000 w-full mx-auto"
            style={{ transform: `rotate(${randomRotation}deg)` }}
        >
            {/* Folder Tab (Sticking out top) */}
            <div 
                className={`absolute -top-3 left-0 w-1/3 h-6 rounded-t-lg ${tabClass} border-t-2 border-l-2 border-r-2 border-stone-800/10 z-0 bg-opacity-100`}
                style={tabStyle}
            ></div>

            {/* Main Folder Body */}
            <div 
                className={`
                    h-40 md:h-80 w-full rounded-r-xl rounded-bl-xl rounded-tl-none shadow-[4px_4px_0px_rgba(0,0,0,0.1)] 
                    relative overflow-hidden border-2 border-stone-800/10
                    ${cardClass}
                    group-hover:shadow-[8px_8px_0px_rgba(0,0,0,0.15)] transition-all duration-300
                `}
                style={cardStyle}
            >
                {/* Solid Color Background Base (Double assurance for opacity) */}
                <div className={`absolute inset-0 ${cardClass} z-0`} style={cardStyle}></div>

                {/* Subtle Texture (Reduced opacity to keep color solid) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply z-10" 
                     style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cardboard.png")` }}>
                </div>

                {/* Pattern Overlay */}
                <div className="absolute inset-0 mix-blend-overlay opacity-10 z-10" 
                     style={{ backgroundImage: selectedPattern, backgroundSize: '20px 20px' }}>
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col p-3 md:p-5 z-20">
                    
                    {/* Top Right: Subject Icon (Sticker style) */}
                    <div className="self-end transform rotate-6 group-hover:rotate-12 transition-transform">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-sm border-2 border-stone-100 flex items-center justify-center">
                            <SubjectIcon size={20} className="text-stone-700 md:hidden" />
                            <SubjectIcon size={28} className="text-stone-700 hidden md:block" />
                        </div>
                    </div>

                    {/* Middle: Decorative Elements (Doodles) */}
                    <div className="absolute top-1/3 left-4 opacity-20 pointer-events-none transform -rotate-12">
                        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-800">
                            <path d="M10 10 C 20 80, 80 20, 90 90" />
                        </svg>
                    </div>

                    {/* Bottom: Title Label (Washi Tape style) */}
                    <div className="mt-auto relative w-full">
                        {/* The Label Background */}
                        <div className="bg-[#fffdf5] p-3 md:p-4 rounded-sm shadow-sm border border-stone-800/5 transform -rotate-1 group-hover:rotate-0 transition-transform mx-2">
                            <h3 className="font-bold text-sm md:text-xl text-stone-800 font-hand leading-tight text-center line-clamp-2">
                                {subject.name}
                            </h3>
                        </div>
                        
                        {/* Washi Tape holding the label */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 md:w-24 h-4 md:h-6 bg-rose-300/80 opacity-90 rotate-2 shadow-sm" style={{ clipPath: 'polygon(2% 0%, 98% 5%, 100% 95%, 0% 100%)' }}></div>
                    </div>

                    {/* ID Stamp */}
                    <div className="absolute bottom-2 right-3 opacity-30 transform rotate-[-5deg]">
                        <div className="text-[10px] md:text-xs font-mono text-stone-900 font-bold border border-stone-900 px-1 rounded-sm">
                            #{subject.id.slice(0,4)}
                        </div>
                    </div>
                </div>

                {/* Fun Stickers (Randomly placed based on index) */}
                <div className="absolute inset-0 pointer-events-none z-30 hidden md:block">
                    {index % 3 === 0 && (
                        <div className="absolute top-1/2 left-2 transform -rotate-12 opacity-80">
                            <Star size={24} className="text-yellow-500 fill-yellow-200" />
                        </div>
                    )}
                    {index % 3 === 1 && (
                        <div className="absolute top-20 right-20 transform rotate-12 opacity-60">
                            <Heart size={20} className="text-pink-500 fill-pink-200" />
                        </div>
                    )}
                    {index % 3 === 2 && (
                        <div className="absolute bottom-20 left-6 transform rotate-45 opacity-70">
                            <Zap size={24} className="text-blue-500 fill-blue-200" />
                        </div>
                    )}
                </div>
            </div>
            
            {/* Pages Effect (Depth) */}
            <div className="absolute top-2 bottom-2 right-1 w-2 md:w-3 bg-white rounded-r-md border-r border-stone-200 transform translate-x-1 z-[-1]"></div>
            <div className="absolute top-3 bottom-3 right-1 w-2 md:w-3 bg-stone-100 rounded-r-md border-r border-stone-200 transform translate-x-2 z-[-2]"></div>
        </motion.div>
    );
}
