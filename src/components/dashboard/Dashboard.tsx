import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Clock, Star, TrendingUp, Calendar, FileText, ArrowRight, Quote, CheckCircle2, Play, Pause, RefreshCw, Book, Plus, Pin } from 'lucide-react';
import { HandUnderline, Scribble, ChalkStar } from '../shared/Doodles';
import { recentFilesService, RecentFile } from '../../lib/recentFiles';
import { subjectService } from '../../lib/api';
import { FileCard } from '../shared/FileCard';

export function Dashboard({ onAddSubject }: { onAddSubject?: () => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';
  
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll
  });

  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes

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

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const stats = [
    { label: t('study_hours'), value: '12.5', icon: Clock, color: 'text-stone-800', bg: 'bg-[#FFEB3B]', rotate: '-rotate-2' },
    { label: t('completed_tasks'), value: '8', icon: CheckCircle2, color: 'text-stone-800', bg: 'bg-[#4DD0E1]', rotate: 'rotate-1' },
    { label: t('streak_days'), value: '5', icon: TrendingUp, color: 'text-stone-800', bg: 'bg-[#FF9800]', rotate: '-rotate-1' },
  ];

  const handleFileClick = (id: string, name: string) => {
    navigate(`/app/study/${id}`);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar bg-stone-50/50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section - More Compact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="font-hand text-3xl md:text-4xl font-bold text-stone-800 relative inline-block">
              {t('welcome_back')}, <span className="text-school-board">Student</span>!
              <div className="absolute -bottom-1 left-0 w-full text-school-board/30">
                <Scribble />
              </div>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
            <Calendar size={18} className="text-school-board" />
            <p className="font-hand text-lg font-bold text-stone-600">
              {new Date().toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Top Widgets Grid - Mobile Optimized (Side by Side) */}
        <div className="space-y-6">
          
          {/* My Subjects Widget (Smart Integration) */}
          <div>
              <h2 className="font-hand text-xl font-bold text-stone-800 flex items-center gap-2 mb-4">
                <Book size={24} className="text-school-board" />
                {t('your_subjects')}
              </h2>
              
              {subjects.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x px-1">
                  
                  {/* Add New Subject Book */}
                  <motion.button
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onAddSubject} 
                      className="snap-start shrink-0 flex flex-col items-center justify-center gap-3 bg-[#E0E0E0] border-4 border-dashed border-stone-300 rounded-r-xl rounded-l-md shadow-sm w-32 h-44 hover:bg-white hover:border-school-board hover:text-school-board transition-all group relative"
                  >
                        <div className="w-12 h-12 rounded-full bg-stone-200 group-hover:bg-school-board/10 flex items-center justify-center text-stone-400 group-hover:text-school-board transition-colors">
                          <Plus size={24} />
                        </div>
                        <span className="text-sm font-hand font-bold text-stone-400 group-hover:text-school-board text-center px-2">
                          {t('create_new_subject')}
                        </span>
                  </motion.button>

                  {subjects.map((subject: any, i: number) => (
                    <motion.button
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5, rotate: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/app/subject/${subject.id}`)}
                      className={`
                        snap-start shrink-0 relative w-32 h-44 
                        flex flex-col items-center justify-between p-4
                        rounded-r-xl rounded-l-md 
                        shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.15)]
                        transition-all duration-300
                        ${subject.color || 'bg-blue-500'}
                        group overflow-hidden
                      `}
                    >
                        {/* Spine Effect */}
                        <div className="absolute top-0 bottom-0 left-0 w-3 bg-black/10 border-r border-black/5 rounded-l-md"></div>
                        
                        {/* Texture Overlay */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>

                        {/* Content */}
                        <div className="relative z-10 w-full flex flex-col items-center gap-3 mt-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                            <span className="text-2xl font-bold text-white drop-shadow-md">
                              {subject.name.charAt(0)}
                            </span>
                          </div>
                          
                          <div className="w-full bg-white/90 p-2 rounded shadow-sm text-center transform rotate-1 group-hover:rotate-0 transition-transform">
                            <span className="text-xs font-bold font-hand text-stone-800 line-clamp-2 leading-tight">
                              {subject.name}
                            </span>
                          </div>
                        </div>

                        {/* Footer / Decorative */}
                        <div className="relative z-10 w-full flex justify-center">
                          <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                        </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="w-full p-8 border-4 border-dashed border-stone-300 rounded-2xl bg-stone-100/50 flex flex-col items-center text-center gap-4">
                   <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
                      <Book size={40} className="text-stone-300" />
                   </div>
                   <div>
                     <h3 className="font-hand text-2xl font-bold text-stone-700">{t('empty_subjects_title')}</h3>
                     <p className="text-stone-500 max-w-md mx-auto mt-2">{t('empty_subjects_desc')}</p>
                   </div>
                   <button 
                     onClick={onAddSubject}
                     className="mt-2 px-6 py-3 bg-school-board text-white rounded-xl font-bold shadow-lg hover:bg-school-board/90 hover:scale-105 transition-all flex items-center gap-2"
                   >
                     <Plus size={20} />
                     {t('create_first_subject')}
                   </button>
                </div>
              )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, rotate: 0 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} p-3 md:p-4 rounded-xl shadow-sm border border-black/5 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={40} />
              </div>
              
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white/40 p-1.5 rounded-lg">
                    <stat.icon size={16} className="text-stone-800" />
                  </div>
                  <span className="font-hand font-bold text-xs md:text-sm text-stone-800 opacity-70 leading-none">{stat.label}</span>
                </div>
                <div className="font-hand text-2xl md:text-3xl font-bold text-stone-900">{stat.value}</div>
              </div>
            </motion.div>
          ))}

          {/* Focus Timer Widget (Takes 1 slot on mobile, 1 on desktop) */}
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col justify-between relative overflow-hidden group hover:border-school-board transition-colors">
            <div className="flex justify-between items-center mb-1">
               <span className="font-hand font-bold text-xs text-stone-500 uppercase tracking-wider">{t('focus_timer')}</span>
               <div className={`w-2 h-2 rounded-full ${timerActive ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`}></div>
            </div>
            
            <div className="text-center my-1">
              <span className="font-mono text-2xl md:text-3xl font-bold text-stone-800 tracking-tighter">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex justify-center gap-2 mt-1">
              <button 
                onClick={toggleTimer}
                className={`p-1.5 rounded-full ${timerActive ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'} hover:scale-110 transition-transform`}
              >
                {timerActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-1.5 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:scale-110 transition-transform"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Recent Files */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-hand text-xl font-bold text-stone-800 flex items-center gap-2">
                <FileText size={20} className="text-school-board" />
                {t('recent_files')}
              </h2>
            </div>

            {/* Grid for files - Mobile: 2 cols, Desktop: 3 cols */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {recentFiles.length > 0 ? (
                recentFiles.map((file, index) => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    index={index} 
                    onClick={handleFileClick}
                    compact // New prop we might need to support or just rely on CSS
                  />
                ))
              ) : (
                <div className="col-span-full p-8 text-center border-2 border-dashed border-stone-300 rounded-xl bg-stone-50">
                  <p className="font-hand text-stone-400 text-lg">{t('no_recent_files')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Widgets (Quote & Tip) */}
          <div className="space-y-5">
            
            {/* Redesigned Quote Card - "Ripped Paper" Look */}
            <div className="relative group">
               {/* Paper shadow */}
               <div className="absolute inset-0 bg-stone-800/10 transform translate-x-1 translate-y-1 rounded-sm rotate-1"></div>
               
               <div className="bg-[#fff9c4] p-5 relative transform -rotate-1 transition-transform hover:rotate-0 hover:scale-[1.02] shadow-sm border-t-8 border-[#fbc02d]">
                  {/* Pin */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
                    <Pin className="text-red-500 fill-red-500 transform -rotate-12" size={24} />
                  </div>

                  <div className="mt-2 text-center relative z-10">
                    <Quote className="text-[#fbc02d] mb-2 mx-auto opacity-50 w-8 h-8" />
                    <p className="font-hand text-lg md:text-xl text-stone-800 leading-relaxed font-bold">
                      "{t('quote_text')}"
                    </p>
                    <div className="w-12 h-1 bg-[#fbc02d]/30 mx-auto my-3 rounded-full"></div>
                    <p className="font-serif text-xs text-stone-500 uppercase tracking-widest font-bold">
                      {t('quote_author')}
                    </p>
                  </div>
               </div>
            </div>

            {/* Daily Tip - "Post-it" Look */}
            <div className="bg-[#e1f5fe] p-4 rounded-br-[2rem] rounded-tl-lg rounded-tr-lg rounded-bl-lg shadow-sm border border-[#b3e5fc] relative overflow-hidden group hover:shadow-md transition-shadow">
               <div className="absolute top-0 right-0 w-8 h-8 bg-[#b3e5fc] rounded-bl-xl z-10 opacity-50"></div>
               
               <div className="flex items-start gap-3 relative z-10">
                 <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                    <span className="text-xl">💡</span>
                 </div>
                 <div>
                    <h3 className="font-hand font-bold text-stone-800 text-lg mb-1">{t('did_you_know')}</h3>
                    <p className="font-hand text-stone-600 text-sm leading-snug">
                      {t('tip_text')}
                    </p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
