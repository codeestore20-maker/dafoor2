import React from 'react';
import { motion } from 'framer-motion';
import { BoxIcon } from 'lucide-react';
interface SubjectFolderProps {
  name: string;
  icon: BoxIcon;
  color: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}
export function SubjectFolder({
  name,
  icon: Icon,
  color,
  isActive,
  onClick,
  index
}: SubjectFolderProps) {
  return <motion.button onClick={onClick} className={`w-full text-start relative group mb-2 outline-none`} initial={{
    x: -20,
    opacity: 0
  }} animate={{
    x: 0,
    opacity: 1
  }} transition={{
    delay: index * 0.1
  }}>
      {/* Tab Shape */}
      <div className={`
          relative z-10 flex items-center p-3 pl-4 rtl:pl-0 rtl:pr-4 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg border-l-4 rtl:border-l-0 rtl:border-r-4 transition-all duration-200
          ${isActive ? 'bg-school-paper shadow-md translate-x-2 rtl:-translate-x-2' : 'bg-stone-100 hover:bg-stone-50 hover:translate-x-1 rtl:hover:-translate-x-1'}
        `} style={{
      borderLeftColor: isActive || document.dir !== 'rtl' ? color : undefined,
      borderRightColor: document.dir === 'rtl' ? color : undefined,
      clipPath: document.dir === 'rtl' 
        ? 'polygon(100% 0, 5% 0, 0% 50%, 5% 100%, 100% 100%)' 
        : 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)'
    }}>
        <div className={`mr-3 rtl:mr-0 rtl:ml-3 p-1.5 rounded-full ${isActive ? 'bg-school-pencil/20' : 'bg-transparent'}`}>
          <Icon size={18} className={isActive ? 'text-school-board' : 'text-stone-500'} />
        </div>
        <span className={`font-hand text-lg font-bold ${isActive ? 'text-school-board' : 'text-stone-600'}`}>
          {name}
        </span>
      </div>

      {/* Shadow/Depth Layer */}
      <div className="absolute inset-0 bg-black/10 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg z-0 transform translate-y-1 translate-x-1 rtl:-translate-x-1" style={{
      clipPath: document.dir === 'rtl'
        ? 'polygon(100% 0, 5% 0, 0% 50%, 5% 100%, 100% 100%)'
        : 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)'
    }}></div>
    </motion.button>;
}