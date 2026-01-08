import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckMark, ChalkStar } from '../shared/Doodles';
import { AlertCircle, ArrowRight, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export function QuizMode() {
  const { fileId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<any[]>([]);

  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['quiz', fileId],
    queryFn: () => resourceService.getQuiz(fileId!),
    enabled: !!fileId,
    retry: false
  });

  useEffect(() => {
    if (quiz?.questions) {
      setLocalQuestions(quiz.questions);
      handleRestart();
    }
  }, [quiz]);

  const generateMutation = useMutation({
    mutationFn: () => resourceService.generateQuiz(fileId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', fileId] });
    }
  });

  const mistakeMutation = useMutation({
    mutationFn: (concept: string) => resourceService.recordMistake(fileId!, concept)
  });

  const handleSubmit = () => {
    if (!currentQuestion) return;
    setSubmitted(true);
    const correct = selected === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    } else {
        // Record mistake if concept is available, or use question text prefix
        const concept = currentQuestion.concept || currentQuestion.text.substring(0, 50) + "...";
        mistakeMutation.mutate(concept);
    }
  };

  const handleNext = () => {
    if (currentQIndex < localQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelected(null);
      setSubmitted(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelected(null);
    setSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setCompleted(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
         <div className="animate-spin mb-4">
            <RefreshCw size={32} />
         </div>
         <p className="font-hand text-xl">{t('loading_quiz')}</p>
      </div>
    );
  }

  if (isError || !quiz || !localQuestions.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="bg-school-board/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-school-board">
            <HelpCircle size={40} />
          </div>
          <h2 className="font-hand text-3xl font-bold text-stone-800 mb-4">
            {t('quiz_empty')}
          </h2>
          <p className="font-hand text-stone-600 mb-8">
            {t('quiz_desc')}
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
                {t('generate_quiz')}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = localQuestions[currentQIndex];

  if (completed) {
    return <div className="h-full p-4 md:p-8 flex justify-center items-center">
        <motion.div initial={{
        scale: 0.9,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} className="bg-white p-6 md:p-12 rounded-xl shadow-lg text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-paper-pattern opacity-30 pointer-events-none"></div>
          <ChalkStar className="w-20 h-20 md:w-24 md:h-24 text-yellow-500 mx-auto mb-4 md:mb-6" />
          <h2 className="font-hand text-3xl md:text-4xl font-bold text-school-board mb-4">
            {t('quiz_complete')}
          </h2>
          <p className="font-serif text-lg md:text-xl text-stone-600 mb-6 md:mb-8">
            {t('quiz_score_msg', { score, total: localQuestions.length })}
          </p>
          <button onClick={handleRestart} className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-school-board text-white rounded-lg font-hand font-bold text-lg md:text-xl hover:bg-school-board/90 transition-colors">
            <RefreshCw size={20} />
            {t('try_again')}
          </button>
        </motion.div>
      </div>;
  }
  return <div className="h-full p-4 md:p-8 flex justify-center items-start overflow-y-auto">
      <motion.div key={currentQIndex} className="bg-white max-w-2xl w-full shadow-lg p-6 md:p-12 relative min-h-[400px] md:min-h-[500px]" initial={{
      x: 20,
      opacity: 0
    }} animate={{
      x: 0,
      opacity: 1
    }} exit={{
      x: -20,
      opacity: 0
    }}>
        {/* Paper Texture */}
        <div className="absolute inset-0 bg-paper-pattern opacity-30 pointer-events-none"></div>

        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6 md:mb-8 flex justify-between items-end">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-widest">
              {t('pop_quiz')}
            </h2>
            <p className="font-hand text-base md:text-lg text-stone-500">
              {t('question_progress', { current: currentQIndex + 1, total: localQuestions.length })}
            </p>
          </div>
          <div className="border-2 border-school-board w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center opacity-80 bg-stone-50">
            <span className="text-school-board font-hand text-lg md:text-xl font-bold">
              {score}/{localQuestions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 md:mb-8">
          <p className="font-serif text-lg md:text-xl font-medium mb-4 md:mb-6 leading-relaxed" dir="auto">
            {currentQuestion.text}
          </p>

          <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((opt: string, idx: number) => <button key={idx} onClick={() => !submitted && setSelected(idx)} disabled={submitted} className={`
                  w-full text-start flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg transition-all border-2 group
                  ${selected === idx ? 'border-school-board bg-school-pencil/10' : 'border-transparent hover:bg-stone-50'}
                  ${submitted && idx === currentQuestion.correctAnswer ? '!border-green-500 !bg-green-50' : ''}
                  ${submitted && selected === idx && !isCorrect ? '!border-red-500 !bg-red-50' : ''}
                `}>
                <div className={`
                  w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${selected === idx ? 'border-school-board bg-school-board text-white' : 'border-stone-400 text-transparent'}
                  ${submitted && idx === currentQuestion.correctAnswer ? '!border-green-600 !bg-green-600 !text-white' : ''}
                  ${submitted && selected === idx && !isCorrect ? '!border-red-600 !bg-red-600 !text-white' : ''}
                `}>
                  <div className="w-2.5 h-2.5 bg-current rounded-full" />
                </div>
                <span className="font-hand text-xl pt-1" dir="auto">{opt}</span>
                {submitted && idx === currentQuestion.correctAnswer && <CheckMark className="text-green-600 w-6 h-6 ml-auto rtl:mr-auto rtl:ml-0" />}
              </button>)}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 min-h-[80px]">
          {!submitted ? <div className="flex justify-end">
              <button onClick={handleSubmit} disabled={selected === null} className="px-8 py-3 bg-school-board text-white font-hand text-xl rounded-lg shadow-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                {t('submit_answer')}
              </button>
            </div> : <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} className={`p-4 rounded-lg border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-center gap-3">
                {isCorrect ? <ChalkStar className="text-yellow-500 w-8 h-8 flex-shrink-0" /> : <AlertCircle className="w-8 h-8 flex-shrink-0" />}
                <div className="flex flex-col">
                    <span className="font-hand text-xl font-bold">
                    {isCorrect ? t('correct_msg') : t('incorrect_msg')}
                    </span>
                    {!isCorrect && currentQuestion.explanation && (
                        <span className="text-sm mt-1 break-words">{currentQuestion.explanation}</span>
                    )}
                </div>
              </div>
              <button onClick={handleNext} className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-hand font-bold text-lg shadow-sm transition-colors mt-2 md:mt-0 ${isCorrect ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {currentQIndex < localQuestions.length - 1 ? t('next_question') : t('finish_quiz')}
                <ArrowRight size={18} className="flip-rtl" />
              </button>
            </motion.div>}
        </div>
      </motion.div>
    </div>;
}