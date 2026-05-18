import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, MoreVertical, Paperclip, Pin } from 'lucide-react';

interface FileCardProps {
  file: {
    id: string;
    name?: string;
    title?: string;
    type: string;
    size?: string;
    subject?: string;
    time?: string;
  };
  index: number;
  viewMode?: 'grid' | 'list';
  compact?: boolean; // New prop for compact mode
  onClick: (id: string, name: string) => void;
}

export function FileCard({ file, index, viewMode = 'grid', compact = false, onClick }: FileCardProps) {
  const fileName = file.name || file.title || 'Untitled';
  const fileSize = file.size ? (parseInt(file.size) / 1024).toFixed(1) + ' KB' : '';

  // Theme configuration based on file type - Memo/Note Style
  const getTheme = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'PDF':
        return {
          wrapper: 'bg-[#FFEBEE]', // Very light red paper
          header: 'bg-[#EF5350]', // Red tape/header
          border: 'border-[#FFCDD2]',
          text: 'text-[#B71C1C]',
          icon: 'text-[#D32F2F]',
          shadow: 'shadow-red-100',
          rotate: 'rotate-1',
          pattern: 'radial-gradient(#EF9A9A 1px, transparent 1px)' // Dots
        };
      case 'DOC':
      case 'DOCX':
        return {
          wrapper: 'bg-[#E3F2FD]', // Very light blue paper
          header: 'bg-[#42A5F5]', // Blue tape/header
          border: 'border-[#BBDEFB]',
          text: 'text-[#0D47A1]',
          icon: 'text-[#1976D2]',
          shadow: 'shadow-blue-100',
          rotate: '-rotate-1',
          pattern: 'repeating-linear-gradient(0deg, transparent, transparent 23px, #90CAF9 24px)' // Lined paper
        };
      case 'PPT':
      case 'PPTX':
        return {
          wrapper: 'bg-[#FFF8E1]', // Very light yellow/orange paper
          header: 'bg-[#FFA726]', // Orange tape/header
          border: 'border-[#FFE0B2]',
          text: 'text-[#E65100]',
          icon: 'text-[#F57C00]',
          shadow: 'shadow-orange-100',
          rotate: 'rotate-2',
          pattern: 'linear-gradient(90deg, transparent 95%, #FFCC80 95%)' // Vertical margin line look or grid
        };
      default: // TXT
        return {
          wrapper: 'bg-[#F5F5F5]', // Light grey paper
          header: 'bg-[#757575]', // Grey tape/header
          border: 'border-[#E0E0E0]',
          text: 'text-[#424242]',
          icon: 'text-[#616161]',
          shadow: 'shadow-stone-200',
          rotate: '-rotate-1',
          pattern: 'radial-gradient(#BDBDBD 1px, transparent 1px)' // Dots
        };
    }
  };

  const theme = getTheme(file.type);

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => onClick(file.id, fileName)}
        className={`
          relative group cursor-pointer 
          flex items-center gap-4 p-3 rounded-lg
          bg-white border-b border-stone-200 hover:bg-stone-50 
          transition-all duration-200
        `}
      >
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${theme.wrapper} ${theme.icon} border ${theme.border}`}>
          <FileText size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-stone-800 font-hand text-lg truncate">
            {fileName}
          </h3>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="uppercase">{file.type}</span>
            <span>•</span>
            <span>{file.time}</span>
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
           <ExternalLink size={16} className="text-stone-400" />
        </div>
      </motion.div>
    );
  }

  // Grid Mode (Supports Compact)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      onClick={() => onClick(file.id, fileName)}
      className={`
        relative group cursor-pointer 
        flex flex-col
        bg-white
        ${compact ? 'p-2 h-32 md:p-3 md:h-40' : 'p-3 h-48 md:p-4 md:h-60'}
        shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1
        transition-all duration-300
        border-2 border-stone-100 hover:border-stone-200
        rounded-xl overflow-hidden
      `}
      style={{
        transform: `rotate(${Math.random() * 2 - 1}deg)`,
      }}
    >
      {/* Tape Effect at top center */}
      <div className={`
        absolute -top-3 left-1/2 -translate-x-1/2 
        w-24 h-6 
        bg-yellow-200/80 backdrop-blur-sm shadow-sm 
        rotate-1 z-20 pointer-events-none
        mix-blend-multiply
      `} style={{ clipPath: 'polygon(5% 0%, 95% 2%, 100% 90%, 0% 100%)' }}></div>

      {/* Polaroid Image Area Placeholder */}
      <div className={`
        w-full flex-1 mb-2 bg-stone-100 relative overflow-hidden
        ${theme.pattern ? '' : 'bg-stone-50'}
        flex items-center justify-center border border-stone-100
      `} style={{ backgroundImage: theme.pattern }}>
         <FileText size={compact ? 32 : 48} className={`${theme.icon} opacity-80 drop-shadow-sm`} />
         
         {/* Type Badge */}
         <div className={`
            absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm rounded-sm
            ${theme.header}
         `}>
            {file.type}
         </div>
      </div>

      {/* Caption Area */}
      <div className="text-center px-1 relative">
        <h3 className={`
          font-bold text-stone-800 font-hand leading-tight line-clamp-2
          ${compact ? 'text-sm' : 'text-lg'}
        `}>
          {fileName}
        </h3>
        <div className="mt-1 text-[10px] text-stone-400 font-mono">
           {file.time}
        </div>
      </div>
    </motion.div>
  );
}
