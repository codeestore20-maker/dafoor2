import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, TrendingUp, Calendar, ArrowRight, Quote, Plus } from 'lucide-react';
import { recentFilesService } from '../../lib/recentFiles';
import { FileCard } from '../shared/FileCard';
import { Scribble, HandUnderline } from '../shared/Doodles';

export function PlannerOverview({ onSelectSubject }: { onSelectSubject: (id: string) => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  useEffect(() => {
    const files = recentFilesService.getFiles();
    
    // Format for display
    const formattedFiles = files.map(f => {
      const diff = Date.now() - f.timestamp;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff / (1000 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      let timeStr = '';
      if (days > 0) timeStr = t('time_ago_d', { count: days });
      else if (hours > 0) timeStr = t('time_ago_h', { count: hours });
      else timeStr = t('time_ago_m', { count: Math.max(1, minutes) });

      const typeKey = f.type === 'PDF' ? 'file_type_pdf' : 'file_type_txt';
      const typeStr = t(typeKey, { defaultValue: f.type });

      return {
        ...f,
        time: timeStr,
        typeDisplay: typeStr 
      };
    });

    setRecentFiles(formattedFiles);
  }, [t]);

  const stats = [
    { label: t('study_hours'), value: '12.5', icon: Clock, color: 'text-stone-800', bg: 'bg-[#FFEB3B]', rotate: '-rotate-2' },
    { label: t('completed_tasks'), value: '8', icon: Star, color: 'text-stone-800', bg: 'bg-[#4DD0E1]', rotate: 'rotate-1' },
    { label: t('streak_days'), value: '5', icon: TrendingUp, color: 'text-stone-800', bg: 'bg-[#FF9800]', rotate: '-rotate-1' },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
      {/* Lined Paper Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#000000 1px, transparent 1px)',
          backgroundSize: '100% 2rem',
          marginTop: '4rem'
        }}
      ></div>
      
      {/* Red Margin Line */}
      <div className="absolute top-0 bottom-0 left-12 rtl:right-12 rtl:left-auto w-0.5 bg-red-400/30 z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto pl-8 rtl:pr-8 rtl:pl-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="font-hand text-4xl md:text-5xl font-bold text-stone-800 mb-2 relative inline-block">
              {t('welcome_back')}, <span className="text-school-board">Student</span>!
              <div className="absolute -bottom-2 left-0 w-full text-school-board/20">
                <Scribble />
              </div>
            </h1>
            <p className="font-serif text-stone-500 italic text-xl mt-4">
              "{t('ready_to_learn')}"
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-stone-800 transform rotate-2">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-school-board" />
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t('today_date')}</p>
                <p className="font-hand text-xl font-bold text-stone-800">
                  {new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row (Sticky Notes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: Math.random() * 6 - 3 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} p-4 shadow-md text-stone-800 relative group cursor-default hover:scale-105 transition-transform duration-300`}
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 95% 100%, 0% 100%)'
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/30 backdrop-blur-sm shadow-sm border border-white/40 rotate-1"></div>
              
              <div className="flex items-start justify-between mb-2">
                <span className="font-serif font-bold uppercase text-xs tracking-wider opacity-70">{stat.label}</span>
                <stat.icon size={20} className="opacity-70" />
              </div>
              <div className="font-hand text-4xl font-bold">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Recent Files Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-hand text-2xl font-bold text-stone-800">{t('continue_learning')}</h2>
              <div className="h-0.5 flex-1 bg-stone-300 border-b border-dashed border-stone-400"></div>
            </div>

            <div className="space-y-4">
              {recentFiles.length > 0 ? (
                recentFiles.map((file, i) => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    index={i} 
                    viewMode="list" 
                    onClick={() => navigate(`/app/study/${file.id}`)} 
                  />
                ))
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-stone-300 rounded-xl bg-stone-50/50">
                  <p className="font-hand text-stone-400 text-lg">{t('no_recent_files')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions / Quote */}
          <section className="space-y-8">
             {/* Quote Card */}
             <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-school-board relative overflow-hidden">
                <Quote className="absolute top-4 right-4 text-stone-100 w-20 h-20 -rotate-12" />
                <p className="font-serif text-lg text-stone-700 italic relative z-10 leading-relaxed">
                  "The beautiful thing about learning is that no one can take it away from you."
                </p>
                <p className="text-right font-bold text-sm text-stone-400 mt-4 relative z-10">— B.B. King</p>
             </div>

             {/* Placeholder for future widgets */}
             <div className="p-6 rounded-lg border-2 border-stone-800 bg-stone-800 text-white transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer group"
                  onClick={() => onSelectSubject('new')}
             >
                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-hand text-xl font-bold">{t('start_new_subject')}</h3>
                   <ArrowRight className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
                <p className="text-stone-400 text-sm">{t('create_subject_desc')}</p>
             </div>
          </section>
        </div>

      </div>
    </div>
  );
}
