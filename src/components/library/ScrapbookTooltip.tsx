import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface ScrapbookTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext?: () => void;
  onSkip?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  className?: string;
}

export const ScrapbookTooltip: React.FC<ScrapbookTooltipProps> = ({
  step,
  totalSteps,
  title,
  description,
  onNext,
  onSkip,
  position = 'bottom',
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const positionClasses = {
    top: 'bottom-full mb-4 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-4 left-1/2 -translate-x-1/2',
    left: isRTL ? 'right-full mr-4 top-1/2 -translate-y-1/2' : 'left-full mr-4 top-1/2 -translate-y-1/2', // In RTL, left means right visually if we think relative to element? No, left is screen left.
    // Actually simpler:
    // If RTL, and we want it on the "start" side (left visually in LTR, right visually in RTL).
    // Let's stick to absolute positioning relative to the parent container.
    // Ideally the parent has relative positioning.
    
    // Revised logic for RTL/LTR safety:
    // We will assume the parent is the anchor.
    // 'top': Place tooltip above the element.
    // 'bottom': Place tooltip below the element.
    // 'left': Place tooltip to the left of the element (in LTR). In RTL, this is still "left" (screen left).
    // 'right': Place tooltip to the right of the element.
    
    // For 'left' position in LTR: right: 100% + margin.
    // For 'left' position in RTL: right: 100% + margin? No.
    // Let's use Tailwind logic.
  };
  
  // Dynamic positioning styles
  let posStyle = {};
  switch (position) {
    case 'top': posStyle = { bottom: '100%', left: '50%', transform: 'translateX(-50%) marginBottom: 16px' }; break;
    case 'bottom': posStyle = { top: '100%', left: '50%', transform: 'translateX(-50%) marginTop: 16px' }; break;
    case 'left': 
        posStyle = isRTL 
            ? { left: '100%', top: '50%', transform: 'translateY(-50%) marginLeft: 16px' } // To the right in RTL? No, 'left' means physically left.
            : { right: '100%', top: '50%', transform: 'translateY(-50%) marginRight: 16px' };
        break;
    case 'right':
        posStyle = isRTL
            ? { right: '100%', top: '50%', transform: 'translateY(-50%) marginRight: 16px' }
            : { left: '100%', top: '50%', transform: 'translateY(-50%) marginLeft: 16px' };
        break;
    case 'center': posStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed', zIndex: 50 }; break;
  }
  
  // Sticky Note Style
  // Yellow paper with tape and handwritten font.
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ 
          opacity: 1, 
          scale: [1, 1.05, 1], 
          rotate: 0 
        }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut",
            repeatType: "reverse" 
          },
          rotate: { duration: 0.5 }
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute z-50 w-64 ${className}`}
        style={position === 'center' ? posStyle : undefined}
      >
        {/* Helper Arrow logic if not center */}
        {position !== 'center' && (
             <div className={`absolute pointer-events-none ${
                 position === 'top' ? 'top-full left-1/2 -ml-2 -mt-1 text-yellow-200' :
                 position === 'bottom' ? 'bottom-full left-1/2 -ml-2 -mb-1 text-yellow-200' :
                 position === 'left' ? 'left-full top-1/2 -mt-2 -ml-1 text-yellow-200' :
                 'right-full top-1/2 -mt-2 -mr-1 text-yellow-200'
             }`}>
                 <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="transform rotate-45">
                     <rect width="15" height="15" fill="currentColor" />
                 </svg>
             </div>
        )}

        <div className={`
            relative bg-yellow-200 text-stone-800 p-4 rounded-sm shadow-xl
            transform ${position === 'center' ? '' : (Math.random() > 0.5 ? 'rotate-1' : '-rotate-1')}
            border border-yellow-300
        `}>
            {/* Tape Effect */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 rotate-1 backdrop-blur-sm shadow-sm z-10"></div>

            <button 
                onClick={onSkip} 
                className="absolute top-2 right-2 text-stone-500 hover:text-stone-800"
            >
                <X size={14} />
            </button>

            <h3 className="font-hand font-bold text-xl mb-2">{title}</h3>
            <p className="font-sans text-sm mb-4 leading-relaxed">{description}</p>

            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-stone-500 font-mono">
                    {step} / {totalSteps}
                </span>
                {onNext && (
                    <button 
                        onClick={onNext}
                        className="px-3 py-1 bg-stone-800 text-yellow-200 text-sm font-bold rounded-full hover:bg-stone-700 transition-colors font-hand"
                    >
                        {t('tour_next')}
                    </button>
                )}
            </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
