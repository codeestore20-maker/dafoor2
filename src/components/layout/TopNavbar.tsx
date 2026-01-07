import React from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TopNavbar() {
  const { t } = useTranslation();

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
        <button className="flex items-center gap-3 p-1 pl-2 rtl:pl-1 rtl:pr-2 pr-4 rtl:pr-1 rounded-full border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all group">
           <div className="w-8 h-8 bg-stone-200 rounded-full overflow-hidden border border-stone-300 group-hover:border-school-board transition-colors">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
           </div>
           <div className="text-left rtl:text-right hidden sm:block">
             <p className="text-xs font-bold text-stone-700 font-sans leading-tight">Alex Johnson</p>
             <p className="text-[10px] text-stone-500 font-mono leading-tight">Pro Plan</p>
           </div>
           <Settings size={14} className="text-stone-400 group-hover:text-stone-600 ml-1 rtl:ml-0 rtl:mr-1" />
        </button>
      </div>
    </div>
  );
}
