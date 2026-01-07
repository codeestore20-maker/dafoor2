import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndexCard } from '../shared/IndexCard';
import { RefreshCw, Check, RotateCcw, Shuffle, Sparkles, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export function Flashcards() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [localCards, setLocalCards] = useState<any[]>([]);
  const isRtl = i18n.language === 'ar';

  const { data: deck, isLoading, isError } = useQuery({
    queryKey: ['flashcards', fileId],
    queryFn: () => resourceService.getFlashcards(fileId!),
    enabled: !!fileId,
    retry: false
  });

  // Sync local cards with fetched deck
  useEffect(() => {
    if (deck?.cards) {
      setLocalCards(deck.cards);
      setCurrentIndex(0);
      setMasteredCount(0);
      setIsFlipped(false);
    }
  }, [deck]);

  const generateMutation = useMutation({
    mutationFn: () => resourceService.generateFlashcards(fileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', fileId] });
    }
  });

  const mistakeMutation = useMutation({
    mutationFn: (concept: string) => resourceService.recordMistake(fileId!, concept)
  });

  const handleShuffle = () => {
    const shuffled = [...localCards].sort(() => Math.random() - 0.5);
    setLocalCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredCount(prev => prev + 1);
    handleNext();
  };

  const handleMistake = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCard?.front) {
      mistakeMutation.mutate(currentCard.front);
    }
    handleNext();
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % localCards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + localCards.length) % localCards.length);
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
         <div className="animate-spin mb-4">
            <RefreshCw size={32} />
         </div>
         <p className="font-hand text-xl">{t('loading_flashcards')}</p>
      </div>
    );
  }

  if (isError || !deck || !localCards.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="bg-school-board/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-school-board">
            <Layers size={40} />
          </div>
          <h2 className="font-hand text-3xl font-bold text-stone-800 mb-4">
            {t('flashcards_empty')}
          </h2>
          <p className="text-stone-600 mb-8">
            {t('flashcards_desc')}
          </p>
          
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-8 py-3 bg-school-board text-white rounded-xl font-hand font-bold text-xl shadow-[4px_4px_0px_rgba(41,37,36,1)] border-2 border-stone-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                {t('generate_flashcards')}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / localCards.length) * 100;
  const currentCard = localCards[currentIndex];

  return (
    <div className="h-full flex flex-col items-center p-4 md:p-8 relative overflow-y-auto custom-scrollbar">
      
      {/* Top Header Area - Compact & Centered */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-4 md:mb-8 px-4">
         {/* Mastered Counter */}
         <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm border border-stone-100 text-sm font-bold text-green-600">
            <Check size={16} className="text-green-500" />
            <span>{t('mastered_count', { count: masteredCount })}</span>
         </div>
         
         {/* Central Progress Pill */}
         <div className="flex-1 mx-4 md:mx-12 max-w-sm">
            <div className="relative h-4 bg-stone-100 rounded-full overflow-hidden shadow-inner border border-stone-200/50">
                <motion.div 
                    className="h-full bg-gradient-to-r from-school-board to-school-board/80 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
            </div>
            <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] font-bold text-stone-400 tracking-wider">{t('start')}</span>
                <span className="text-[10px] font-bold text-stone-400 tracking-wider">{t('finish')}</span>
            </div>
         </div>

         {/* Shuffle Button */}
         <button 
            onClick={handleShuffle} 
            className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-school-board hover:border-school-board hover:scale-105 transition-all active:scale-95" 
            title="Shuffle Deck"
         >
            <Shuffle size={18} />
         </button>
      </div>

      {/* Main Study Area - Lifted Up */}
      <div className="w-full max-w-6xl flex items-start md:items-center justify-center gap-4 md:gap-16 flex-1 min-h-[500px] pt-8 md:pt-0">
        
        {/* Left Button (Prev in LTR, Next in RTL) */}
        <button 
            onClick={isRtl ? handleNext : handlePrev}
            className="hidden md:flex flex-col items-center gap-2 group transition-all transform hover:-translate-x-1 active:scale-95 z-10"
        >
             <div className="p-4 rounded-2xl bg-white border-2 border-stone-100 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] text-stone-600 group-hover:text-school-board group-hover:border-school-board group-hover:shadow-[4px_4px_0px_rgba(75,85,99,0.1)] transition-all">
                {isRtl ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
             </div>
             <span className="text-xs font-bold text-stone-500 uppercase tracking-widest group-hover:text-school-board transition-colors">
                {isRtl ? t('next') : t('previous')}
             </span>
        </button>

        {/* Card Container */}
        <div className="w-full max-w-2xl perspective-1000 relative -mt-12 md:-mt-24">
            <div className="relative h-[28rem] md:h-[32rem] w-full cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div 
                className="w-full h-full absolute preserve-3d" 
                initial={false} 
                animate={{ rotateY: isFlipped ? 180 : 0 }} 
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                {/* Front of Card - Question */}
                <div className="absolute inset-0 backface-hidden">
                    <IndexCard className="h-full flex flex-col items-center justify-between text-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 ease-out relative overflow-hidden border border-stone-100 rounded-[2rem]">
                        
                        {/* Top Accent - Minimalist Yellow */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-school-pencil/80 w-full z-10" />
                        
                        {/* Subtle Noise Texture */}
                        <div className="absolute inset-0 bg-paper-pattern opacity-[0.03] pointer-events-none" />

                        {/* Content Area */}
                        <div className="flex-1 flex items-center justify-center w-full px-8 md:px-12 pt-10 pb-4 z-10">
                            <h3 className="font-hand text-3xl md:text-4xl text-stone-800 font-bold leading-relaxed tracking-wide antialiased" dir="auto">
                                {currentCard.front}
                            </h3>
                        </div>

                        {/* Bottom Action Area - Integrated */}
                        <div className="w-full pb-8 z-10 flex justify-center">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-stone-300 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-school-pencil transition-colors duration-300">
                                <span>{t('tap_to_flip')}</span>
                                <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                            </div>
                        </div>
                    </IndexCard>
                </div>

                {/* Back of Card - Answer */}
                <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                    <IndexCard className="h-full flex flex-col items-center justify-between text-center bg-[#f8faf9] shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden border border-stone-100 rounded-[2rem]">
                        
                        {/* Top Accent - Minimalist Green */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-school-board/80 w-full z-10" />

                        {/* Subtle Texture & Gradient */}
                        <div className="absolute inset-0 bg-paper-pattern opacity-[0.03] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 to-transparent pointer-events-none" />

                        {/* Content Area */}
                        <div className="flex-1 flex items-center justify-center w-full px-8 md:px-12 pt-10 pb-4 z-10">
                            <div className="w-full relative">
                                <h3 className="font-hand text-2xl md:text-3xl text-stone-800 font-bold leading-loose tracking-wide whitespace-pre-wrap antialiased" dir="auto">
                                    {currentCard.back}
                                </h3>
                            </div>
                        </div>

                        {/* Bottom Action Area */}
                        <div className="w-full pb-8 z-10 flex justify-center">
                             <div className="flex items-center gap-2 px-4 py-2 rounded-full text-stone-300 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-school-board transition-colors duration-300">
                                <span>{t('tap_to_flip')}</span>
                                <RotateCcw size={12} />
                            </div>
                        </div>
                    </IndexCard>
                </div>
            </motion.div>
            </div>

            {/* Action Buttons - Outside, Below & Floating */}
            <AnimatePresence>
                {isFlipped && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute -bottom-28 left-0 right-0 flex items-center justify-center gap-4 md:gap-8 z-20"
                    >
                        <button 
                            onClick={handleMistake} 
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-red-100 text-red-400 shadow-sm flex items-center justify-center group-hover:bg-red-50 group-hover:border-red-200 group-hover:-translate-y-1 group-hover:shadow-md transition-all">
                                <RotateCcw size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-bold text-stone-500 group-hover:text-red-500 transition-colors">{t('review_again')}</span>
                        </button>

                        <button 
                            onClick={handleMastered} 
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-green-100 text-green-500 shadow-sm flex items-center justify-center group-hover:bg-green-50 group-hover:border-green-200 group-hover:-translate-y-1 group-hover:shadow-md transition-all">
                                <Check size={28} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-bold text-stone-500 group-hover:text-green-600 transition-colors">{t('mastered')}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Right Button (Next in LTR, Prev in RTL) */}
        <button 
            onClick={isRtl ? handlePrev : handleNext}
            className="hidden md:flex flex-col items-center gap-2 group transition-all transform hover:translate-x-1 active:scale-95 z-10"
        >
             <div className="p-4 rounded-2xl bg-white border-2 border-stone-100 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] text-stone-600 group-hover:text-school-board group-hover:border-school-board group-hover:shadow-[4px_4px_0px_rgba(75,85,99,0.1)] transition-all">
                {isRtl ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
             </div>
             <span className="text-xs font-bold text-stone-500 uppercase tracking-widest group-hover:text-school-board transition-colors">
                {isRtl ? t('previous') : t('next')}
             </span>
        </button>

      </div>

      {/* Mobile Navigation - Fixed Bottom */}
      <div className="flex md:hidden items-center justify-between w-full px-6 fixed bottom-8 left-0 right-0 z-50 pointer-events-none">
         <button onClick={isRtl ? handleNext : handlePrev} className="pointer-events-auto p-4 bg-white/90 backdrop-blur rounded-full shadow-lg border border-stone-200 text-stone-500 active:scale-90 transition-transform">
            {isRtl ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
         </button>
         
         <div className="pointer-events-auto bg-stone-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-80">
            {currentIndex + 1} / {localCards.length}
         </div>

         <button onClick={isRtl ? handlePrev : handleNext} className="pointer-events-auto p-4 bg-white/90 backdrop-blur rounded-full shadow-lg border border-stone-200 text-stone-500 active:scale-90 transition-transform">
            {isRtl ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
         </button>
      </div>

    </div>
  );
}
