import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsService } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowRight, Check, X, BookOpen, Brain, HelpCircle } from 'lucide-react';

type StepType = 'intro' | 'explanation' | 'question';

export const SmartLessonPlayer = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<StepType>('intro');
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadStep(currentStep);
  }, [topicId, currentStep]);

  const loadStep = async (step: StepType) => {
    try {
      setIsLoading(true);
      setContent(null); // Reset content for animation
      const data = await lessonsService.getStepContent(topicId!, step);
      setContent(data);
    } catch (error) {
      console.error("Failed to load step", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'intro') setCurrentStep('explanation');
    else if (currentStep === 'explanation') setCurrentStep('question');
    else {
      // Finish Lesson
      lessonsService.updateStatus(topicId!, 'completed');
      navigate(-1); // Go back to map
    }
  };

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
  };

  const renderContent = () => {
    if (isLoading || !content) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-medium animate-pulse">جاري تحضير المحتوى...</p>
        </div>
      );
    }

    // Intro & Explanation View
    if (currentStep === 'intro' || currentStep === 'explanation') {
        return (
            <div className="prose prose-lg prose-indigo max-w-none text-right" dir="rtl">
                <ReactMarkdown>{content.markdown}</ReactMarkdown>
            </div>
        );
    }

    // Question View
    if (currentStep === 'question') {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-stone-800">{content.question}</h3>
                <div className="space-y-3">
                    {content.options.map((opt: string, idx: number) => {
                        let statusClass = "border-stone-200 hover:border-indigo-300 hover:bg-indigo-50";
                        if (showResult) {
                            if (idx === content.correctIndex) statusClass = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500";
                            else if (idx === selectedOption) statusClass = "border-red-500 bg-red-50 text-red-700";
                            else statusClass = "opacity-50 grayscale";
                        }
                        
                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className={`w-full p-4 rounded-xl border-2 text-right transition-all duration-200 flex items-center justify-between ${statusClass}`}
                                disabled={showResult}
                            >
                                <span>{opt}</span>
                                {showResult && idx === content.correctIndex && <Check className="text-green-600" />}
                                {showResult && idx === selectedOption && idx !== content.correctIndex && <X className="text-red-600" />}
                            </button>
                        );
                    })}
                </div>
                
                {showResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${selectedOption === content.correctIndex ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                    >
                        <p className="font-bold mb-1">
                            {selectedOption === content.correctIndex ? "🎉 إجابة صحيحة!" : "😅 حاول مرة أخرى"}
                        </p>
                        <p className="text-sm opacity-90">{content.explanation}</p>
                    </motion.div>
                )}
            </div>
        );
    }
  };

  const getStepIcon = () => {
      switch(currentStep) {
          case 'intro': return <BookOpen className="w-6 h-6 text-blue-500" />;
          case 'explanation': return <Brain className="w-6 h-6 text-purple-500" />;
          case 'question': return <HelpCircle className="w-6 h-6 text-orange-500" />;
      }
  };

  const getStepTitle = () => {
      switch(currentStep) {
          case 'intro': return "مقدمة";
          case 'explanation': return "الشرح";
          case 'question': return "اختبر فهمك";
      }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
        
        {/* Header */}
        <div className="bg-white border-b border-stone-100 p-4 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-50 rounded-full text-stone-400">
                <ArrowRight size={20} />
            </button>
            <div className="flex items-center gap-2 font-bold text-stone-700">
                {getStepIcon()}
                <span>{getStepTitle()}</span>
            </div>
            <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-stone-100 w-full flex">
            <div className={`h-full transition-all duration-500 bg-blue-500 ${currentStep === 'intro' ? 'w-1/3' : currentStep === 'explanation' ? 'w-2/3' : 'w-full'}`}></div>
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
            <div className="text-xs text-stone-400 font-medium">
                {currentStep === 'intro' ? 'الخطوة 1 من 3' : currentStep === 'explanation' ? 'الخطوة 2 من 3' : 'الخطوة 3 من 3'}
            </div>
            
            <button
                onClick={handleNext}
                disabled={currentStep === 'question' && !showResult}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                    ${currentStep === 'question' && !showResult 
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 shadow-indigo-100'}`}
            >
                {currentStep === 'question' ? 'إنهاء الدرس' : 'التالي'}
                <ArrowLeft size={18} />
            </button>
        </div>

      </div>
    </div>
  );
};
