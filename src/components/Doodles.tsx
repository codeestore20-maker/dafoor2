import React from 'react';
import { motion } from 'framer-motion';
export const ChalkStar = ({
  className = 'w-6 h-6',
  delay = 0
}: {
  className?: string;
  delay?: number;
}) => <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} initial={{
  scale: 0,
  rotate: -180
}} animate={{
  scale: 1,
  rotate: 0
}} transition={{
  type: 'spring',
  stiffness: 260,
  damping: 20,
  delay
}}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </motion.svg>;

export const HandCircle = ({ className = 'w-full h-full' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M 20 50 Q 20 20, 50 20 Q 80 20, 80 50 Q 80 80, 50 80 Q 20 80, 20 50 Z M 22 52 Q 25 85, 52 82" 
          vectorEffect="non-scaling-stroke" />
  </svg>
);

export const HandArrow = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M 5 10 L 45 10 M 35 2 L 45 10 L 35 18" vectorEffect="non-scaling-stroke" />
  </svg>
);

export const Scribble = ({ className = 'w-full h-full' }: { className?: string }) => (
  <svg viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} preserveAspectRatio="none">
    <path d="M 0 10 Q 10 0, 20 10 T 40 10 T 60 10 T 80 10 T 100 10" vectorEffect="non-scaling-stroke" />
  </svg>
);
export const HandUnderline = ({
  className = 'w-full h-2'
}: {
  className?: string;
}) => <svg viewBox="0 0 100 5" preserveAspectRatio="none" className={className}>
    <path d="M0 2.5 Q 25 5, 50 2.5 T 100 2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>;
export const ChalkCharacter = ({
  emotion = 'happy'
}: {
  emotion?: 'happy' | 'thinking' | 'excited';
}) => {
  return <motion.svg viewBox="0 0 100 120" className="w-full h-full text-school-chalk drop-shadow-md" initial={{
    y: 0
  }} animate={{
    y: [0, -5, 0]
  }} transition={{
    repeat: Infinity,
    duration: 4,
    ease: 'easeInOut'
  }}>
      {/* Head */}
      <circle cx="50" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="3" />

      {/* Face */}
      {emotion === 'happy' && <>
          <circle cx="43" cy="25" r="2" fill="currentColor" />
          <circle cx="57" cy="25" r="2" fill="currentColor" />
          <path d="M40 35 Q 50 45, 60 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>}
      {emotion === 'thinking' && <>
          <circle cx="43" cy="25" r="2" fill="currentColor" />
          <circle cx="57" cy="25" r="2" fill="currentColor" />
          <line x1="45" y1="38" x2="55" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>}

      {/* Body */}
      <line x1="50" y1="50" x2="50" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* Arms */}
      <path d="M50 60 L 25 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 60 L 75 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* Legs */}
      <path d="M50 90 L 35 115" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 90 L 65 115" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>;
};
export const CheckMark = ({
  className = 'w-6 h-6'
}: {
  className?: string;
}) => <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} initial={{
  pathLength: 0,
  opacity: 0
}} animate={{
  pathLength: 1,
  opacity: 1
}} transition={{
  duration: 0.5,
  ease: 'easeOut'
}}>
    <path d="M20 6L9 17l-5-5" />
  </motion.svg>;