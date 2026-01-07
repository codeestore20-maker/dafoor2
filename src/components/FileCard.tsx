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
  onClick: (id: string, name: string) => void;
}

export function FileCard({ file, index, viewMode = 'grid', onClick }: FileCardProps) {
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
          <div className="flex items-center gap-2 text-xs font-serif text-stone-500">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${theme.wrapper} ${theme.text}`}>{file.type}</span>
            {fileSize && <span>• {fileSize}</span>}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View (Note/Memo Style)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: Math.random() * 2 - 1 }}
      whileHover={{ scale: 1.02, rotate: 0, y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => onClick(file.id, fileName)}
      className={`
        group relative cursor-pointer
        flex flex-col
        min-h-[220px] // Increased height as requested
        ${theme.wrapper}
        shadow-md hover:shadow-xl
        transition-all duration-300
      `}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', // Clean rectangle
        // Alternatively for a torn look: polygon(0 0, 100% 0, 100% 98%, 98% 100%, 0 100%)
      }}
    >
      {/* Top Tape/Header Strip */}
      <div className={`h-8 w-full ${theme.header} opacity-90 relative flex items-center justify-center`}>
        {/* Tape Effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/20 backdrop-blur-sm rotate-1 shadow-sm"></div>
        <div className="text-white font-serif text-[10px] font-bold tracking-[0.2em] uppercase">
          {file.type} MEMO
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 top-8 opacity-20 pointer-events-none" 
           style={{ backgroundImage: theme.pattern, backgroundSize: '24px 24px' }}></div>

      {/* Main Content */}
      <div className="flex-1 p-5 flex flex-col relative z-10">
        
        {/* Date/Time Stamp */}
        <div className="flex justify-end mb-2">
          <span className={`text-[10px] font-serif italic ${theme.text} opacity-60`}>
            {file.time || 'Just now'}
          </span>
        </div>

        {/* Title */}
        <div className="mb-auto">
          <h3 className={`font-hand text-2xl font-bold leading-tight ${theme.text} line-clamp-3`}>
            {fileName}
          </h3>
          <div className={`h-0.5 w-12 mt-2 ${theme.header} opacity-30 rounded-full`}></div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className={`p-1.5 rounded-full bg-white/60 shadow-sm ${theme.icon}`}>
               <FileText size={16} />
             </div>
             <span className={`text-xs font-bold font-hand ${theme.text} opacity-70`}>
               {fileSize}
             </span>
           </div>

           <div className={`
             w-8 h-8 rounded-full flex items-center justify-center 
             bg-white shadow-sm opacity-0 group-hover:opacity-100 
             transform translate-y-2 group-hover:translate-y-0 
             transition-all duration-300 ${theme.icon}
           `}>
             <ExternalLink size={16} />
           </div>
        </div>
      </div>

      {/* Bottom Edge Shadow/Curl */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
    </motion.div>
  );
}
