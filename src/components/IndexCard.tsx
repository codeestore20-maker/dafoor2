import React from 'react';
import { motion } from 'framer-motion';
interface IndexCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  rotate?: number;
}
export function IndexCard({
  children,
  className = '',
  onClick,
  rotate = 0
}: IndexCardProps) {
  return <motion.div className={`bg-school-paper relative shadow-md rounded-sm p-6 overflow-hidden border border-stone-200 ${className}`} onClick={onClick} initial={{
    rotate
  }} whileHover={{
    scale: 1.02,
    rotate: 0,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }} transition={{
    type: 'spring',
    stiffness: 300,
    damping: 20
  }}>
      {/* Texture */}
      <div className="absolute inset-0 bg-paper-pattern opacity-40 pointer-events-none"></div>

      {/* Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
      backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px)',
      backgroundSize: '100% 24px',
      marginTop: '24px'
    }}></div>

      {/* Red top line */}
      <div className="absolute top-6 left-0 right-0 h-px bg-school-red/30 pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </motion.div>;
}