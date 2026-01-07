import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, Star, TrendingUp, Calendar, FileText, ArrowRight, Quote, Pin } from 'lucide-react';
import { HandUnderline, Scribble, ChalkStar } from '../shared/Doodles';

import { FileCard } from '../shared/FileCard';

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const recentFiles = [
    { id: '1', name: 'Physics_Chapter_1.pdf', subject: 'Physics', time: '2h ago', type: 'PDF', size: '2048' },
    { id: '2', name: 'History_Notes.txt', subject: 'History', time: '5h ago', type: 'TXT', size: '1024' },
    { id: '3', name: 'Math_Formulas.pdf', subject: 'Mathematics', time: '1d ago', type: 'PDF', size: '3072' },
  ];

  const stats = [
    { label: t('study_hours'), value: '12.5', icon: Clock, color: 'text-stone-800', bg: 'bg-[#FFEB3B]', rotate: '-rotate-2' },
    { label: t('completed_tasks'), value: '8', icon: Star, color: 'text-stone-800', bg: 'bg-[#4DD0E1]', rotate: 'rotate-1' },
    { label: t('streak_days'), value: '5', icon: TrendingUp, color: 'text-stone-800', bg: 'bg-[#FF9800]', rotate: '-rotate-1' },
  ];

  const handleFileClick = (id: string, name: string) => {
    // In a real app, this would navigate to the file
    console.log('Navigate to', id);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-100">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b-2 border-dashed border-stone-300">
          <div>
            <h1 className="font-hand text-4xl font-bold text-stone-800 mb-2 relative inline-block">
              {t('welcome_back')}, <span className="text-school-board">Student</span>!
              <div className="absolute -bottom-2 left-0 w-full text-school-board/30">
                <Scribble />
              </div>
            </h1>
            <p className="font-serif text-stone-500 text-lg italic mt-3">
              {t('ready_to_learn')}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-xl shadow-sm border-2 border-stone-800 transform rotate-1">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-school-board" />
              <div className="text-right rtl:text-left">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('today_date')}</p>
                <p className="font-hand text-lg font-bold text-stone-800">
                  {new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - Sticky Notes Style - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-2">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: Math.random() * 4 - 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.1 }}
              className={`relative h-28 p-3 shadow-md flex flex-col justify-between ${stat.bg} ${stat.rotate} rounded-sm`}
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 92% 100%, 0% 100%)'
              }}
            >
              {/* Tape Effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 backdrop-blur-sm rotate-1 shadow-sm border border-white/50"></div>
              
              <div className="flex justify-between items-start">
                <stat.icon size={20} className="text-stone-800 opacity-60" />
                <div className="text-2xl font-hand font-bold text-stone-800">{stat.value}</div>
              </div>
              
              <div className="mt-auto">
                 <p className="font-hand text-sm font-bold text-stone-800 leading-tight">{stat.label}</p>
                 <div className="w-6 h-1 bg-stone-800/20 mt-1.5 rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity - Corkboard Style - Compact */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-hand text-xl font-bold text-stone-800 flex items-center gap-2">
              <div className="bg-stone-800 text-white p-1 rounded-md transform -rotate-3">
                <FileText size={16} />
              </div>
              {t('recent_files')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentFiles.map((file, index) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  index={index} 
                  onClick={handleFileClick}
                />
              ))}
            </div>
          </div>

          {/* Quote - Special Card Style - Refined */}
          <div className="space-y-4">
            <h2 className="font-hand text-xl font-bold text-stone-800 flex items-center gap-2">
              <ChalkStar className="text-school-board w-5 h-5" />
              {t('daily_quote')}
            </h2>
            
            <div className="bg-[#F3E5F5] p-5 shadow-md relative overflow-hidden group transform rotate-1 border border-[#E1BEE7] rounded-sm transition-transform hover:scale-[1.02]"
                 style={{ 
                   backgroundImage: 'linear-gradient(to bottom, transparent 19px, #E1BEE7 20px)',
                   backgroundSize: '100% 20px'
                 }}>
              
              {/* Washi Tape */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#BA68C8] opacity-80 shadow-sm -rotate-1 border-l-2 border-r-2 border-white/20"></div>

              <div className="relative z-10 mt-2 text-center">
                <Quote className="text-[#AB47BC] mb-2 mx-auto opacity-80" size={24} />
                <blockquote className="font-hand text-lg text-stone-700 leading-relaxed tracking-wide mb-3 italic">
                  "{t('quote_text')}"
                </blockquote>
                <p className="font-hand text-xs text-[#8E24AA] font-bold uppercase tracking-widest">
                  — {t('quote_author')}
                </p>
              </div>
            </div>

            {/* Quick Tip - Torn Paper */}
            <div className="bg-[#FFF9C4] p-5 shadow-md relative mt-6 transform rotate-1" style={{ clipPath: 'polygon(3% 0, 100% 0, 97% 100%, 0% 98%)' }}>
               <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-stone-300 shadow-inner"></div>
               <h3 className="font-bold text-stone-800 mb-1 flex items-center gap-2 font-hand text-base mt-1">
                <span className="text-xl">💡</span> {t('did_you_know')}
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed font-serif italic">
                {t('tip_text')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
