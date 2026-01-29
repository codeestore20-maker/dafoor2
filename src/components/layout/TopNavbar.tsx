import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut, Languages, HelpCircle, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function TopNavbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = i18n.language === 'ar';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Use type assertion to Node to fix type error, and ensure current exists
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white border-b-2 border-stone-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-school-board text-white rounded-lg flex items-center justify-center border-2 border-stone-800 shadow-[2px_2px_0px_rgba(41,37,36,1)]">
          <span className="font-hand font-bold text-2xl">L</span>
        </div>
        <h1 className="font-hand text-2xl font-bold text-stone-800 hidden sm:block">
          {t('app_name')}
        </h1>
      </div>

      {/* Center Search (Optional, or keep it in the main area) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input 
          type="text" 
          placeholder={t('search_placeholder_global')} 
          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:border-school-board focus:bg-white transition-all font-hand text-sm"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 rtl:right-auto rtl:left-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-stone-200 mx-1"></div>

        {/* User Profile Dropdown Trigger */}
        <div className="relative z-50" ref={dropdownRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className={`flex items-center gap-3 p-1 pl-2 rtl:pl-1 rtl:pr-2 pr-4 rtl:pr-1 rounded-full border border-stone-200 transition-all group ${isDropdownOpen ? 'bg-stone-50 border-stone-300' : 'hover:bg-stone-50 hover:border-stone-300'}`}
          >
             <div className="w-8 h-8 bg-stone-200 rounded-full overflow-hidden border border-stone-300 group-hover:border-school-board transition-colors">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Student'}`} alt="User" />
             </div>
             <div className="text-left rtl:text-right hidden sm:block">
               <p className="text-xs font-bold text-stone-700 font-sans leading-tight max-w-[100px] truncate">{user?.name || 'Student'}</p>
               <p className="text-[10px] text-stone-500 font-mono leading-tight">{t('pro_plan')}</p>
             </div>
             <ChevronDown size={14} className={`text-stone-400 group-hover:text-stone-600 ml-1 rtl:ml-0 rtl:mr-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-stone-100 overflow-hidden"
                style={{ zIndex: 100 }}
              >
                {/* User Info Mobile Only */}
                <div className="sm:hidden p-4 border-b border-stone-100 bg-stone-50">
                  <p className="font-bold text-stone-800">{user?.name || 'Student'}</p>
                  <p className="text-xs text-stone-500">{user?.email}</p>
                </div>

                <div className="p-2">
                   <button className="w-full text-left rtl:text-right px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700 font-medium text-sm flex items-center gap-3 transition-colors">
                      <User size={16} className="text-stone-400" />
                      {t('profile')}
                   </button>
                   <button className="w-full text-left rtl:text-right px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700 font-medium text-sm flex items-center gap-3 transition-colors">
                      <Settings size={16} className="text-stone-400" />
                      {t('settings')}
                   </button>
                   <button 
                      onClick={toggleLanguage}
                      className="w-full text-left rtl:text-right px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700 font-medium text-sm flex items-center gap-3 transition-colors"
                   >
                      <Languages size={16} className="text-stone-400" />
                      <div className="flex-1 flex justify-between items-center">
                        <span>{isRtl ? 'English' : 'العربية'}</span>
                        <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 border border-stone-200">
                           {isRtl ? 'EN' : 'AR'}
                        </span>
                      </div>
                   </button>
                </div>

                <div className="h-px bg-stone-100 mx-2"></div>

                <div className="p-2">
                   <button className="w-full text-left rtl:text-right px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700 font-medium text-sm flex items-center gap-3 transition-colors">
                      <HelpCircle size={16} className="text-stone-400" />
                      {t('help')}
                   </button>
                   <button 
                      onClick={logout}
                      className="w-full text-left rtl:text-right px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium text-sm flex items-center gap-3 transition-colors mt-1"
                   >
                      <LogOut size={16} className="text-red-400" />
                      {t('log_out')}
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
