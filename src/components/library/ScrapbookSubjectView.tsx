import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { FileCard } from '../shared/FileCard';
import { UploadModal } from '../shared/UploadModal';
import { useOnboarding } from '../../context/OnboardingContext';
import { 
  Book, Calculator, FlaskConical, Globe, Languages, Music, Palette, Laptop, Layout, 
  Grid, List as ListIcon, Upload, Sticker, ArrowLeft
} from 'lucide-react';

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
  'bg-stone-300', 
  'bg-amber-100',
];

export function ScrapbookSubjectView({ subject, viewMode, setViewMode, onBack }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { currentStep, completeStep, skipTour } = useOnboarding();

    // Determine color
    const getSubjectColor = () => {
        if (subject.color && subject.color !== 'bg-blue-200' && !subject.color.includes('gray')) {
            return subject.color;
        }
        const hash = subject.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        return FOLDER_COLORS[hash % FOLDER_COLORS.length];
    };
    const subjectColor = getSubjectColor();
    const finalColor = subjectColor.includes('stone-300') ? 'bg-orange-100' : subjectColor;

    // Fetch resources
    const { data: files = [], isLoading, refetch } = useQuery({
        queryKey: ['resources', subject.id],
        queryFn: () => resourceService.getAll(subject.id),
        enabled: !!subject.id
    });

    const filteredFiles = files.filter((f: any) => 
        (f.name || f.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: -20 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="w-full h-full flex flex-col bg-white rounded-xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-stone-800 overflow-hidden relative"
        >
            {/* Notebook Header */}
            <div className={`min-h-[7rem] md:min-h-[9rem] ${subjectColor} p-4 md:p-8 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-4 md:gap-8 border-b-2 md:border-b-4 border-stone-800 shadow-sm z-20`}>
                {/* Decorative Pattern (Subtle grid) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-black/5"></div>
                <div className="absolute -top-3 left-10 w-32 h-8 bg-yellow-200/90 rotate-2 shadow-sm z-0 hidden md:block" style={{ clipPath: 'polygon(2% 0%, 98% 5%, 100% 95%, 0% 100%)' }}></div>

                {/* Left Section: Back & Title */}
                <div className="relative z-10 flex items-center w-full md:w-auto gap-3 md:gap-5">
                   {/* Back Button (Circle Sticker Style) */}
                   <button 
                      onClick={onBack}
                      className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm border-2 border-stone-800 rounded-full flex items-center justify-center shadow-sm hover:scale-110 hover:rotate-6 transition-all flex-shrink-0 group"
                   >
                      <ArrowLeft size={20} className={`text-stone-800 group-hover:text-stone-900 ${isRtl ? 'rotate-180' : ''}`} />
                   </button>

                   {/* Icon & Title Group */}
                   <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                       {/* Icon Sticker */}
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 border-stone-800 rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transform -rotate-3 flex-shrink-0">
                          {React.createElement(ICON_MAP[subject.icon] || ICON_MAP.default, { size: 24, className: "text-stone-800 md:hidden" })}
                          {React.createElement(ICON_MAP[subject.icon] || ICON_MAP.default, { size: 32, className: "text-stone-800 hidden md:block" })}
                       </div>
                       
                       {/* Title Text */}
                       <div className="flex flex-col">
                          <h2 className="text-xl md:text-3xl font-bold text-stone-900 font-hand leading-tight tracking-tight drop-shadow-sm line-clamp-1">
                            {subject.name}
                          </h2>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-stone-700/80 font-bold text-xs md:text-sm font-hand">
                                {t('files_count', { count: files.length })}
                            </span>
                            <div className="h-px w-8 bg-stone-800/20"></div>
                          </div>
                       </div>
                   </div>
                </div>

                {/* Right Section: Actions Toolbar */}
                <div className="w-full md:w-auto flex items-center justify-end gap-3 relative z-10">
                     {/* View Mode Toggles */}
                     <div className="flex items-center gap-1 bg-white/30 backdrop-blur-md p-1 rounded-xl border border-stone-800/10">
                         <button onClick={() => setViewMode('grid')} className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-600 hover:bg-white/50'}`}>
                            <Grid size={18} />
                         </button>
                         <button onClick={() => setViewMode('list')} className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-600 hover:bg-white/50'}`}>
                            <ListIcon size={18} />
                         </button>
                     </div>
                     
                     {/* Upload Button */}
                     <div className="relative">
                        <motion.button 
                           onClick={() => setIsUploadOpen(true)} 
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-yellow-50 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all text-sm md:text-base border-2 border-transparent hover:border-yellow-200/50"
                        >
                           <Upload size={16} className="md:hidden" />
                           <Upload size={18} className="hidden md:block" />
                           <span className="hidden sm:inline">{t('upload_file')}</span>
                           <span className="sm:hidden">{t('upload')}</span>
                        </motion.button>
                     </div>
                </div>
            </div>

            {/* Notebook Content (Paper) */}
            <div className="flex-1 bg-[#fffbf0] relative overflow-hidden flex flex-col">
                {/* Lined Paper Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-20" 
                     style={{ backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '100% 2rem', marginTop: '2rem' }}></div>
                
                {/* Red Margin Line - Responsive Position */}
                <div className="absolute top-0 bottom-0 left-6 md:left-10 rtl:right-6 md:rtl:right-10 rtl:left-auto w-0.5 bg-red-400/30 z-0"></div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pl-10 md:pl-16 rtl:pr-10 md:rtl:pr-16 rtl:pl-4 md:rtl:pl-6 relative z-10">
                   {isLoading ? (
                     <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-4 border-school-board"></div>
                     </div>
                   ) : filteredFiles.length > 0 ? (
                     <div className={`
                       ${viewMode === 'grid' 
                         ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6' 
                         : 'flex flex-col gap-2 md:gap-3'
                       }
                     `}>
                       {filteredFiles.map((file: any, index: number) => (
                         <div key={file.id} style={{ transform: viewMode === 'grid' ? `rotate(${index % 3 === 0 ? 1 : index % 3 === 1 ? -1 : 0}deg)` : 'none' }}>
                            <FileCard 
                                file={file} 
                                index={index} 
                                viewMode={viewMode}
                                onClick={(id) => navigate(`/app/study/${id}`)}
                                compact={viewMode === 'grid'}
                            />
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center opacity-60">
                        <Sticker size={48} className="text-stone-400 mb-4 md:hidden" />
                        <Sticker size={64} className="text-stone-400 mb-4 hidden md:block" />
                        <h3 className="text-xl md:text-2xl font-bold text-stone-500 mb-2">{t('quiet_here')}</h3>
                        <p className="text-stone-400 font-hand text-base md:text-lg max-w-xs md:max-w-none mb-6">{t('upload_first_doc_desc')}</p>
                        
                        <button 
                           onClick={() => setIsUploadOpen(true)}
                           className="flex items-center gap-2 px-6 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-300 hover:text-stone-800 transition-all transform hover:scale-105 hover:-rotate-1 border-2 border-stone-300 border-dashed hover:border-stone-400"
                        >
                            <Upload size={20} />
                            {t('upload_file')}
                        </button>
                     </div>
                   )}
                </div>
            </div>

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={(file, lang) => {
                    const formData = new FormData();
                    formData.append('subjectId', subject.id);
                    formData.append('language', lang);
                    formData.append('file', file);
                    
                    resourceService.upload(formData).then(() => {
                        refetch();
                        setIsUploadOpen(false);
                        if (currentStep === 2) completeStep();
                    });
                }}
            />
        </motion.div>
    );
}
