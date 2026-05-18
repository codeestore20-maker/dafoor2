import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, BookOpen, Loader2 } from 'lucide-react';

interface BrandSkeletonProps {
  type?: 'lesson' | 'summary' | 'quiz' | 'general' | 'card';
  message?: string;
  hideMessage?: boolean;
  className?: string;
}

const loadingMessages = {
  lesson: [
    "جاري تحضير الدرس...",
    "نستخلص أهم النقاط...",
    "نجهز لك شرحاً مبسطاً...",
    "نرتب المعلومات لتسهل عليك..."
  ],
  summary: [
    "نقرأ الملف بالكامل...",
    "نستخرج الزبدة والمفيد...",
    "نصيغ الملخص بأسلوب ذكي...",
    "نضع اللمسات الأخيرة..."
  ],
  quiz: [
    "نراجع المعلومات...",
    "نصيغ أسئلة ذكية...",
    "نتأكد من دقة الإجابات...",
    "نجهز التحدي..."
  ],
  general: [
    "جاري التجهيز...",
    "لحظات ويصبح كل شيء جاهزاً...",
    "نعمل على ترتيب المحتوى..."
  ]
};

export function BrandSkeleton({ type = 'general', message, hideMessage = false, className = '' }: BrandSkeletonProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // تدوير الرسائل كل 3 ثواني لإعطاء شعور بالحيوية
  useEffect(() => {
    const messages = loadingMessages[type as keyof typeof loadingMessages] || loadingMessages.general;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [type]);

  const messages = loadingMessages[type as keyof typeof loadingMessages] || loadingMessages.general;
  const activeMessage = message || messages[currentMessageIndex];

  // تحديد الأيقونة المناسبة
  const Icon = (type === 'lesson' || type === 'card') ? BookOpen : type === 'summary' ? Sparkles : type === 'quiz' ? Brain : Loader2;

  return (
    <div className={`w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-200 ${className}`}>
      
      {/* الأيقونة المتحركة */}
      <div className="relative mb-6">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 p-4 bg-white rounded-2xl shadow-sm border border-stone-100"
        >
          <Icon className="w-8 h-8 text-school-board" />
        </motion.div>
        
        {/* خلفية متوهجة */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-school-board rounded-full blur-xl"
        />
      </div>

      {/* النص المتحرك */}
      {!hideMessage && (
        <motion.div
          key={activeMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center space-y-2 max-w-md"
        >
          <h3 className="text-lg font-hand font-bold text-stone-700">
            {activeMessage}
          </h3>
          <div className="h-1.5 w-32 bg-stone-200 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-school-board"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

      {/* خطوط هيكلية (Skeleton Lines) لإعطاء إيحاء بالمحتوى القادم */}
      <div className="mt-8 w-full max-w-lg space-y-3 opacity-30">
        <div className="h-3 bg-stone-300 rounded-full w-3/4 mx-auto animate-pulse" />
        <div className="h-3 bg-stone-300 rounded-full w-full animate-pulse delay-75" />
        <div className="h-3 bg-stone-300 rounded-full w-5/6 mx-auto animate-pulse delay-150" />
      </div>
    </div>
  );
}
