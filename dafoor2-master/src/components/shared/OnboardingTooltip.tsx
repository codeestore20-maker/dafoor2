import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface OnboardingTooltipProps {
  isVisible: boolean;
  onClose: () => void;
  text: string;
  step?: number;
  totalSteps?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  targetRef?: React.RefObject<HTMLElement>;
}

export function OnboardingTooltip({ 
  isVisible, 
  onClose, 
  text, 
  step, 
  totalSteps,
  position = 'bottom' 
}: OnboardingTooltipProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`
            absolute z-50 w-64 p-4 
            bg-school-board text-white rounded-xl shadow-xl 
            border-2 border-stone-800
            ${position === 'bottom' ? 'top-full mt-3' : ''}
            ${position === 'top' ? 'bottom-full mb-3' : ''}
            ${position === 'left' ? 'right-full mr-3' : ''}
            ${position === 'right' ? 'left-full ml-3' : ''}
            left-1/2 -translate-x-1/2
          `}
        >
          {/* Arrow */}
          <div className={`
            absolute w-4 h-4 bg-school-board border-l-2 border-t-2 border-stone-800 transform rotate-45
            ${position === 'bottom' ? '-top-2.5 left-1/2 -translate-x-1/2 bg-school-board' : ''}
            ${position === 'top' ? '-bottom-2.5 left-1/2 -translate-x-1/2 rotate-[225deg]' : ''}
          `}></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="font-hand font-bold text-school-pencil text-sm uppercase tracking-wider">
                Tip {step && totalSteps ? `#${step}` : ''}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            <p className="font-hand text-sm leading-relaxed text-white/90">
              {text}
            </p>

            {step && totalSteps && (
              <div className="mt-3 flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 flex-1 rounded-full ${i + 1 <= step ? 'bg-school-pencil' : 'bg-white/20'}`}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
