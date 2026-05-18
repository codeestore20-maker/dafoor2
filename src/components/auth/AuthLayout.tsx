import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, GraduationCap, Sparkles, Star, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    // Fixed absolute positioning ensures it fills the viewport exactly, regardless of parent flex quirks
    <div className="absolute inset-0 bg-[#FFF8E7] overflow-y-auto custom-scrollbar font-hand z-50">
       {/* Desk Texture Background */}
       <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{
        backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
        backgroundColor: '#d4c4a8'
      }}></div>

      {/* Language Switcher */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-4 right-4 rtl:left-4 rtl:right-auto z-50 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg border-2 border-stone-800 hover:bg-school-board hover:text-white transition-all transform hover:scale-110 active:scale-95"
        title={t('switch_language')}
      >
        <Languages size={20} />
      </button>

      {/* Scrollable Content Container */}
      <div className="min-h-full w-full flex flex-col md:flex-row items-center justify-center p-4 md:p-8 relative z-10 py-12 md:py-8">
      
        {/* Main Card Container */}
        <div className="w-full max-w-5xl bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[auto] md:min-h-[600px] border-2 md:border-4 border-stone-800 relative">
          
          {/* Marketing Section (Hidden on very small screens, visible on md+) */}
          <div className={`
            hidden md:flex w-full md:w-5/12 bg-school-board text-white p-8 md:p-12 flex-col justify-between relative overflow-hidden
            ${isRtl ? 'order-last md:order-last' : 'order-first md:order-first'}
          `}>
           {/* Pattern Overlay */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")`
           }}></div>

           {/* Floating Elements Animation */}
           <motion.div 
             animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} 
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-20 right-10 opacity-20 pointer-events-none"
           >
              <Sparkles size={120} />
           </motion.div>

           <div className="relative z-10">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 mb-10 shadow-sm">
                <GraduationCap size={24} className="text-school-pencil" />
                <span className="font-bold tracking-wider uppercase text-sm">{t('app_name')}</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-sm">
                {t('marketing_quote')}
              </h1>
              <p className="text-xl text-stone-200 font-serif italic leading-relaxed">
                {t('marketing_sub')}
              </p>
           </div>

           {/* Dynamic Content Area */}
           <div className="relative z-10 mt-12 space-y-6">
              
              {/* Testimonial Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 relative"
              >
                <div className="absolute -top-3 -left-3 text-school-pencil">
                  <Star fill="currentColor" size={24} />
                </div>
                <p className="text-sm font-medium mb-2 leading-relaxed">"{t('testimonial_1')}"</p>
                <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">— {t('testimonial_author_1')}</p>
              </motion.div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                      <div className="bg-school-pencil text-stone-900 p-1.5 rounded-full">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-xl font-bold leading-none">10k+</p>
                        <p className="text-[10px] opacity-70 uppercase">{t('stat_users')}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="bg-blue-400 text-stone-900 p-1.5 rounded-full">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xl font-bold leading-none">500k+</p>
                        <p className="text-[10px] opacity-70 uppercase">{t('stat_hours')}</p>
                      </div>
                  </div>
              </div>
           </div>
        </div>

        {/* Form Section (Right in LTR, Left in RTL) */}
        <div className="w-full md:w-7/12 bg-[#fdfbf7] p-6 sm:p-8 md:p-10 lg:p-16 flex flex-col justify-center relative">
          {/* Mobile Header (Visible only on mobile) */}
          <div className="md:hidden flex items-center gap-2 mb-6 justify-center text-school-board">
             <GraduationCap size={32} />
             <span className="font-bold tracking-wider uppercase text-lg">{t('app_name')}</span>
          </div>

          {/* Paper Texture */}
          <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`
          }}></div>

          <div className="max-w-md mx-auto w-full relative z-10">
             <div className="mb-10 text-center md:text-start md:rtl:text-right">
                <h2 className="text-4xl font-bold text-stone-800 mb-3">{title}</h2>
                <p className="text-stone-500 font-serif italic text-lg">{subtitle}</p>
             </div>

             {children}
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}
