import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndexCard } from '../shared/IndexCard';
import { Scribble } from '../shared/Doodles';
import { RefreshCw, Check, RotateCcw, Shuffle, Sparkles, Layers } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export function Flashcards() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [localCards, setLocalCards] = useState<any[]>([]);

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

  const handleMastered = () => {
    setMasteredCount(prev => prev + 1);
    handleNext();
  };

  const handleMistake = () => {
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
            {t('flashcards_ready')}
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

  return <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 relative">
      {/* Top Controls */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6 rtl:right-auto rtl:left-4 md:rtl:left-6 flex items-center gap-4">
        <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-stone-200 text-sm font-bold text-green-600">
          {t('mastered_count', { count: masteredCount })}
        </div>
        <button onClick={handleShuffle} className="p-2 bg-white rounded-full shadow-sm border border-stone-200 text-stone-500 hover:text-school-board transition-colors" title="Shuffle Deck">
          <Shuffle size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-4 md:top-6 left-4 md:left-6 rtl:left-auto rtl:right-4 md:rtl:right-6 w-24 md:w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
        <div className="h-full bg-school-board transition-all duration-300" style={{
        width: `${progress}%`
      }}></div>
      </div>

      <div className="w-full max-w-md perspective-1000 mt-12 md:mt-0">
        <div className="relative h-64 md:h-72 w-full cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
          <motion.div className="w-full h-full absolute preserve-3d" initial={false} animate={{
          rotateY: isFlipped ? 180 : 0
        }} transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20
        }}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden">
              <IndexCard className="h-full flex items-center justify-center text-center p-6 md:p-8">
                <h3 className="font-hand text-2xl md:text-3xl text-school-board font-bold" dir="auto">
                  {currentCard.front}
                </h3>
                <span className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 text-xs text-stone-400 font-hand">
                  {t('tap_to_flip')}
                </span>
              </IndexCard>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden" style={{
            transform: 'rotateY(180deg)'
          }}>
              <IndexCard className="h-full flex items-center justify-center text-center p-6 md:p-8 bg-yellow-50">
                <h3 className="font-hand text-2xl md:text-3xl text-school-red font-bold" dir="auto">
                  {currentCard.back}
                </h3>
              </IndexCard>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto px-4">
        <button onClick={handleMistake} className="w-full md:w-auto flex justify-center items-center gap-2 px-6 py-3 bg-white border-2 border-stone-200 text-stone-600 rounded-full font-hand text-lg md:text-xl shadow-sm hover:bg-stone-50 hover:border-stone-300 transition-all">
          <RotateCcw size={18} className="flip-rtl" />
          {t('review_again')}
        </button>

        <button onClick={handleMastered} className="w-full md:w-auto flex justify-center items-center gap-2 px-8 py-3 bg-school-board text-white rounded-full font-hand text-lg md:text-xl shadow-lg hover:bg-opacity-90 transition-all transform hover:scale-105">
          <Check size={20} />
          {t('mastered')}
        </button>
      </div>
    </div>;
}