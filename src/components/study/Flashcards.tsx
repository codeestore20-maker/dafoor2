import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, RotateCcw, Shuffle, Sparkles, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
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
         <p className="font-hand text-xl font-bold">{t('loading_flashcards')}</p>
      </div>
    );
  }

  if (isError || !deck || !localCards.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center relative">
          {/* Background Doodle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-school-board/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="bg-white border-2 border-stone-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 text-school-board shadow-[4px_4px_0px_rgba(0,0,0,0.1)] rotate-3">
            <Layers size={48} />
          </div>
          <h2 className="font-hand text-4xl font-bold text-stone-800 mb-4">
            {t('flashcards_empty')}
          </h2>
          <p className="font-hand text-stone-500 mb-8 text-lg leading-relaxed">
            {t('flashcards_desc')}
          </p>
          
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-8 py-4 bg-school-board text-white rounded-xl font-hand font-bold text-xl shadow-[4px_4px_0px_rgba(41,37,36,1)] border-2 border-stone-800 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)] transition-all active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw size={24} className="animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Sparkles size={24} />
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
    <div className="h-full flex flex-col items-center relative overflow-hidden bg-transparent">
      
      {/* Top Header Area */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between p-4 md:p-8 z-20">
         {/* Mastered Counter - Sticker Style */}
         <div className="flex items-center gap-2 bg-[#e6f4ea] border-2 border-[#1e8e3e] text-[#1e8e3e] px-4 py-2 rounded-lg shadow-sm transform -rotate-2">
            <Check size={20} strokeWidth={3} />
            <span className="font-hand font-bold text-lg pt-1">{t('mastered_count', { count: masteredCount })}</span>
         </div>
         
         {/* Central Progress Ruler */}
         <div className="flex-1 mx-4 md:mx-16 max-w-md hidden md:block">
            <div className="relative h-4 bg-[#f0ebd8] rounded-sm border border-stone-300 shadow-inner overflow-hidden">
                {/* Ruler markings */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, #a8a29e 95%)', backgroundSize: '10px 100%' }}></div>
                
                <motion.div 
                    className="h-full bg-school-board/80 relative" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-school-board shadow-[0_0_10px_rgba(0,0,0,0.2)]"></div>
                </motion.div>
            </div>
            <div className="flex justify-between mt-1 px-1">
                <span className="font-hand text-xs font-bold text-stone-400">{currentIndex + 1}</span>
                <span className="font-hand text-xs font-bold text-stone-400">{localCards.length}</span>
            </div>
         </div>

         {/* Shuffle Button */}
         <button 
            onClick={handleShuffle} 
            className="p-3 bg-white border-2 border-stone-200 text-stone-400 rounded-xl hover:text-school-board hover:border-school-board hover:rotate-6 transition-all shadow-sm active:scale-95" 
            title="Shuffle Deck"
         >
            <Shuffle size={20} />
         </button>
      </div>

      {/* Main Study Area */}
      <div className="w-full max-w-7xl flex items-center justify-center gap-4 md:gap-8 flex-1 relative z-10 px-4">
        
        {/* Navigation Arrows */}
        <button 
            onClick={isRtl ? handleNext : handlePrev}
            className="hidden md:flex p-4 text-stone-300 hover:text-school-board hover:scale-110 transition-all absolute left-4 xl:left-0 z-20"
        >
             <ChevronLeft size={48} strokeWidth={2.5} />
        </button>

        <button 
            onClick={isRtl ? handlePrev : handleNext}
            className="hidden md:flex p-4 text-stone-300 hover:text-school-board hover:scale-110 transition-all absolute right-4 xl:right-0 z-20"
        >
             <ChevronRight size={48} strokeWidth={2.5} />
        </button>

        {/* Card Container */}
        <div className="w-full max-w-2xl perspective-1000 relative -mt-8 md:-mt-16">
            <div className="relative aspect-[1.5/1] md:aspect-[1.6/1] w-full cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div 
                className="w-full h-full absolute preserve-3d" 
                initial={false} 
                animate={{ rotateY: isFlipped ? 180 : 0 }} 
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                {/* Front of Card - White Paper */}
                <div className="absolute inset-0 backface-hidden rounded-2xl md:rounded-[2rem] bg-white overflow-hidden shadow-[2px_8px_30px_rgba(0,0,0,0.1)] border border-stone-200" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateX(0deg)' }}>
                    <div className="h-full w-full flex flex-col relative">
                        {/* Paper Texture & Lines */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
                        <div className="absolute inset-0" style={{ 
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
                            backgroundAttachment: 'local'
                        }}></div>
                        
                        {/* Red Margin Line */}
                        <div className="absolute top-0 bottom-0 left-12 rtl:right-12 rtl:left-auto w-0.5 bg-red-400/20 z-0"></div>
                        
                        {/* Content Area */}
                        <div className="flex-1 flex items-center justify-center w-full px-16 md:px-24 z-10">
                            <h3 className="font-hand text-2xl md:text-4xl text-stone-800 font-bold leading-relaxed text-center" dir="auto">
                                {currentCard.front}
                            </h3>
                        </div>

                        {/* Bottom Hint */}
                        <div className="w-full pb-6 z-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-stone-100/80 text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                                <span>{t('tap_to_flip')}</span>
                                <RotateCcw size={12} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back of Card - Yellow Paper */}
                <div className="absolute inset-0 backface-hidden rounded-2xl md:rounded-[2rem] bg-[#fefce8] overflow-hidden shadow-[2px_8px_30px_rgba(0,0,0,0.1)] border border-yellow-300/50" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <div className="h-full w-full flex flex-col relative">
                        {/* Paper Texture & Lines */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
                        <div className="absolute inset-0" style={{ 
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #fef08a 31px, #fef08a 32px)',
                            backgroundAttachment: 'local'
                        }}></div>
                        
                        {/* Content Area */}
                        <div className="flex-1 flex items-center justify-center w-full px-12 md:px-20 z-10">
                            <div className="w-full relative">
                                <h3 className="font-hand text-xl md:text-3xl text-stone-800 font-bold leading-loose text-center whitespace-pre-wrap" dir="auto">
                                    {currentCard.back}
                                </h3>
                            </div>
                        </div>

                        {/* Bottom Hint */}
                        <div className="w-full pb-6 z-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-200/50 text-yellow-700/50 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                                <span>{t('tap_to_flip')}</span>
                                <RotateCcw size={12} />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            </div>

            {/* Action Buttons - Appearing when flipped */}
            <AnimatePresence>
                {isFlipped && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute -bottom-32 left-0 right-0 flex items-center justify-center gap-8 md:gap-16 z-20"
                    >
                        <button 
                            onClick={handleMistake} 
                            className="group flex flex-col items-center gap-3"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 border-red-100 text-red-400 shadow-sm flex items-center justify-center group-hover:bg-red-50 group-hover:border-red-300 group-hover:-translate-y-2 group-hover:shadow-md transition-all transform hover:rotate-[-6deg]">
                                <RotateCcw size={28} strokeWidth={3} />
                            </div>
                            <span className="font-hand text-sm md:text-lg font-bold text-stone-400 group-hover:text-red-500 transition-colors">{t('review_again')}</span>
                        </button>

                        <button 
                            onClick={handleMastered} 
                            className="group flex flex-col items-center gap-3"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 border-green-100 text-green-500 shadow-sm flex items-center justify-center group-hover:bg-green-50 group-hover:border-green-300 group-hover:-translate-y-2 group-hover:shadow-md transition-all transform hover:rotate-[6deg]">
                                <Check size={36} strokeWidth={4} />
                            </div>
                            <span className="font-hand text-sm md:text-lg font-bold text-stone-400 group-hover:text-green-600 transition-colors">{t('mastered')}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>

      {/* Mobile Navigation - Fixed Bottom */}
      <div className="flex md:hidden items-center justify-between w-full px-6 fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
         <button onClick={isRtl ? handleNext : handlePrev} className="pointer-events-auto p-4 bg-white/90 backdrop-blur rounded-full shadow-lg border border-stone-200 text-stone-500 active:scale-90 transition-transform">
            <ChevronLeft size={24} />
         </button>
         
         <div className="pointer-events-auto bg-stone-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-80 font-hand">
            {currentIndex + 1} / {localCards.length}
         </div>

         <button onClick={isRtl ? handlePrev : handleNext} className="pointer-events-auto p-4 bg-white/90 backdrop-blur rounded-full shadow-lg border border-stone-200 text-stone-500 active:scale-90 transition-transform">
            <ChevronRight size={24} />
         </button>
      </div>

    </div>
  );
}
