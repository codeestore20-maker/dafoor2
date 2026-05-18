import React from 'react';

interface NotebookPaperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function NotebookPaper({
  children,
  className = '',
  title
}: NotebookPaperProps) {
  // Fix for Safari overflow: remove max-w-full from container to restore desktop layout.
  // Content overflow is handled by break-words on children wrapper.
  return <div className={`relative bg-white shadow-md ${className}`}>
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 bg-paper-pattern opacity-30 pointer-events-none z-10 h-full w-full"></div>

      {/* Red Margin Line */}
      <div className="absolute top-0 bottom-0 left-5 md:left-10 rtl:right-5 rtl:md:right-10 rtl:left-auto w-px bg-red-400/40 z-0 h-full"></div>

      {/* Blue Horizontal Lines Pattern */}
      <div className="absolute inset-0 z-0 h-full w-full" style={{
      backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
      backgroundSize: '100% 32px',
      marginTop: '32px'
    }}></div>

      {/* Content */}
      <div className="relative z-20 pt-2 pl-5 pr-3 md:pl-14 md:pr-6 rtl:pr-5 rtl:pl-3 rtl:md:pr-14 rtl:md:pl-6 pb-8 h-full">
        {title && <div className="mb-4 md:mb-6 border-b-2 border-red-400/20 pb-1">
            <h2 className="font-hand text-xl md:text-4xl text-stone-800 font-bold tracking-wide break-words leading-tight">
              {title}
            </h2>
          </div>}
        <div className="font-hand text-base md:text-xl leading-relaxed md:leading-[32px] text-school-graphite min-h-[500px] break-words whitespace-normal">
          {children}
        </div>
      </div>

      {/* Holes (Fixed to left/right) */}
      <div className="absolute left-1 md:left-3 rtl:right-1 rtl:md:right-3 rtl:left-auto top-0 bottom-0 flex flex-col gap-[32px] pt-[36px] z-20 h-full pointer-events-none">
        {[...Array(20)].map((_, i) => <div key={i} className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-stone-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] border border-stone-200/50"></div>)}
      </div>
    </div>;
}