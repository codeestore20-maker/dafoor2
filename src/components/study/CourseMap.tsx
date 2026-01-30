import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceService, lessonsService } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
    Sparkles, Target, Brain, GraduationCap, ArrowRight, ArrowLeft,
    Clock, Menu, X, CheckCircle, AlertCircle, Loader2, Quote,
    Lightbulb, HelpCircle, Map as MapIcon, Flag, ChevronRight, ChevronLeft,
    Play, Lock, Star, Download, Share2, Check, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrandSkeleton } from '../shared/BrandSkeleton';

// --- 1. TYPES & CONFIGURATION ---

interface Topic {
  id: string;
  title: string;
  difficulty: string;
  timeEstimate: string;
  status: 'locked' | 'ready' | 'in_progress' | 'completed';
  relevance: number;
  progress: number;
}

type StepType = 'context' | 'core' | 'challenge' | 'takeaway';
const STEPS_ORDER: StepType[] = ['context', 'core', 'challenge', 'takeaway'];

const STEP_DETAILS: Record<StepType, { label: string; icon: any; apiType?: 'intro' | 'explanation' | 'question' | 'outro' }> = {
    'context': { label: 'المفهوم', icon: Sparkles, apiType: 'intro' },
    'core': { label: 'الزبدة', icon: Brain, apiType: 'explanation' },
    'challenge': { label: 'تحدي', icon: Target, apiType: 'question' },
    'takeaway': { label: 'الخلاصة', icon: GraduationCap, apiType: 'outro' },
};

// --- 2. UI PRIMITIVES (Strict Design System) ---

// Green Brand Button (From Flashcards.tsx identity)
const BrandButton = ({ children, onClick, disabled, icon: Icon, className = '', variant = 'primary', size = 'normal' }: any) => {
    const baseStyle = "rounded-xl font-hand font-bold flex items-center justify-center gap-2 transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeStyles = {
        small: "px-3 py-1.5 text-sm",
        normal: "px-6 py-3 text-lg",
        large: "px-8 py-4 text-xl"
    };

    const variants = {
        primary: "bg-school-board text-white border-2 border-stone-800 shadow-[4px_4px_0px_rgba(41,37,36,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(41,37,36,1)]",
        secondary: "bg-white text-stone-800 border-2 border-stone-800 shadow-[3px_3px_0px_rgba(41,37,36,1)] hover:bg-stone-50 hover:translate-y-[2px] hover:shadow-[1px_1px_0px_rgba(41,37,36,1)]",
        ghost: "bg-transparent text-stone-600 hover:bg-stone-100 border-2 border-transparent hover:border-stone-200 shadow-none px-2"
    };

    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizeStyles[size as keyof typeof sizeStyles]} ${variants[variant as keyof typeof variants]} ${className}`}>
            {Icon && <Icon size={size === 'small' ? 16 : 20} />}
            {children}
        </button>
    );
};

const PaperCard = ({ children, className = '', ...props }: any) => (
    <div className={`bg-white rounded-xl border-2 border-stone-200 shadow-sm relative overflow-hidden ${className}`} {...props}>
        {children}
    </div>
);

const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            components={{
                h1: () => null,
                h2: ({node, ...props}) => <h3 className="text-xl font-bold text-stone-800 mb-3 mt-4 font-hand border-b-2 border-stone-100 pb-1" {...props} />,
                h3: ({node, ...props}) => <h4 className="text-lg font-bold text-school-board mb-2 mt-3 font-hand flex items-center gap-2" {...props} />,
                p: ({node, ...props}) => <p className="text-base text-stone-700 leading-relaxed mb-3 font-medium text-right" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-1 mb-3 pr-5 list-disc marker:text-school-board text-right" {...props} />,
                li: ({node, ...props}) => <li className="text-stone-700 font-medium text-base pl-1" {...props} />,
                strong: ({node, ...props}) => <span className="font-bold text-school-board bg-[#e8f5e9] px-1 rounded mx-0.5" {...props} />,
                blockquote: ({node, ...props}) => (
                    <div className="my-4 p-3 bg-[#fffdeb] border-r-4 border-school-board rounded-lg shadow-sm italic text-stone-700 font-hand text-base relative text-right">
                        {props.children}
                    </div>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

// --- 3. STAGE COMPONENTS (Refined & Compact) ---

const ContextStage = ({ content }: { content: any }) => {
    // Fallback for markdown content
    const textContent = content?.markdown || (typeof content === 'string' ? content : "");
    
    return (
        <div className="w-full flex justify-center px-1 sm:px-0">
            <PaperCard className="p-4 sm:p-6 md:p-10 w-full max-w-3xl min-h-[500px] bg-[#fcfbf9] relative overflow-hidden border-stone-200/80 shadow-sm mx-auto">
                
                {/* Header */}
                <div className="relative z-10 flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white text-stone-600 flex items-center justify-center mb-3 shadow-sm border border-stone-100">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold font-hand text-stone-800 mb-2 tracking-tight">مقدمة الدرس</h2>
                    
                    {/* Dynamic Quote */}
                    <div className="max-w-lg mx-auto relative px-4">
                        <p className="text-base font-hand font-medium text-stone-400 italic leading-relaxed">
                            "{content?.quote || "التعلم ليس مجرد حفظ، بل هو رحلة اكتشاف وفهم عميق لما حولنا."}"
                        </p>
                    </div>
                </div>

                {/* Main Content (Intro) - Inside a Card */}
                <div className="relative z-10 max-w-2xl mx-auto mb-10">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-stone-100 text-center relative">
                        {/* Decorative Quote Icon */}
                        <Quote size={32} className="absolute -top-4 right-8 text-stone-100 bg-white px-1" />
                        
                        <div className="prose prose-lg prose-stone max-w-none font-hand">
                            <div className="text-lg md:text-xl leading-loose text-stone-700 font-medium">
                                <MarkdownRenderer content={textContent} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info Cards */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-dashed border-stone-200 pt-8">
                    
                    {/* The Hook */}
                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50 hover:bg-amber-50/80 transition-colors">
                        <h3 className="font-bold font-hand text-amber-700 mb-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <Lightbulb size={12} />
                            الأهمية
                        </h3>
                        <p className="text-sm text-stone-600 leading-relaxed font-hand text-center font-bold">
                            {content?.hook || "هذا المفهوم أساسي لبناء فهمك العميق وتطبيقاتك العملية مستقبلاً."}
                        </p>
                    </div>

                    {/* Quick Fact */}
                    <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100/50 hover:bg-sky-50/80 transition-colors transform md:-translate-y-2">
                        <h3 className="font-bold font-hand text-sky-700 mb-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <Star size={12} />
                            هل تعلم؟
                        </h3>
                        <p className="text-sm text-stone-600 leading-relaxed font-hand text-center">
                            {content?.quickFact || "هذا الموضوع يعتبر من الركائز الأساسية التي يعتمد عليها الخبراء في هذا المجال."}
                        </p>
                    </div>

                    {/* Key Terms */}
                    <div className="bg-stone-50/40 p-4 rounded-xl border border-stone-100/50 hover:bg-stone-50/80 transition-colors">
                        <h3 className="font-bold font-hand text-stone-500 mb-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <Brain size={12} />
                            المصطلحات
                        </h3>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {content?.keyTerms && content.keyTerms.length > 0 ? (
                                content.keyTerms.map((term: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-white border border-stone-200 rounded-[4px] text-[10px] font-bold text-stone-500 shadow-sm">
                                        {term.split(' ')[0]}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] text-stone-400">سيتم تحميل المصطلحات...</span>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer Signature */}
                <div className="relative z-10 mt-8 text-center">
                    <span className="text-[9px] text-stone-300 font-mono tracking-widest uppercase">LMS OFFICIAL BRIEFING • {new Date().getFullYear()}</span>
                </div>

            </PaperCard>
        </div>
    );
};

const CoreStage = ({ content }: { content: any }) => {
    const sections = content?.lessonSections || [];
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        const element = document.getElementById('core-summary-card');
        if (!element) return;

        setIsDownloading(true);
        try {
            const actions = element.querySelector('#summary-actions');
            if (actions) (actions as HTMLElement).style.display = 'none';

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#fcfbf9', // Changed back to creamy as requested
                useCORS: true
            });

            if (actions) (actions as HTMLElement).style.display = 'flex';

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width mm
            const pageHeight = 297; // A4 height mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let pdf;
            if (imgHeight > pageHeight) {
                pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: [imgWidth, imgHeight]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }
            
            pdf.save('LMS-Summary.pdf');
        } catch (error) {
            console.error('PDF Error:', error);
        } finally {
            setIsDownloading(false);
        }
    };
    
    if (sections.length > 0) {
        return (
            <div className="w-full flex justify-center px-1 sm:px-0">
                <PaperCard 
                    id="core-summary-card" 
                    className="p-4 sm:p-8 md:p-16 w-full max-w-5xl min-h-[600px] relative overflow-hidden print:shadow-none print:border-none mx-auto"
                    style={{ backgroundColor: '#fcfbf9' }}
                >
                    
                    {/* Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none z-0">
                        <div className="flex flex-col items-center transform -rotate-45">
                            <Brain size={400} />
                            <span className="text-6xl font-black mt-8 uppercase tracking-widest">LMS STUDY</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b-2 border-stone-100/80">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold font-hand text-stone-800">الزبدة</h2>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">ملخص الدرس المركز</p>
                            </div>
                         </div>

                         {/* Actions */}
                         <div id="summary-actions" className="flex items-center gap-2 print:hidden">
                             <button 
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-600 transition-colors disabled:opacity-50"
                                title="تحميل PDF"
                             >
                                 {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                 <span className="text-sm font-bold font-hand hidden sm:inline">{isDownloading ? 'جاري التحميل...' : 'تحميل PDF'}</span>
                             </button>
                             <button className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-600 transition-colors">
                                 <Share2 size={18} />
                             </button>
                         </div>
                    </div>

                    <div className="relative z-10 space-y-12">
                        {sections.map((section: any, idx: number) => {
                             const isAlert = section.icon === 'alert';
                             const isStar = section.icon === 'star';
                             
                             let Icon = Lightbulb;
                             let themeClass = "prose-stone"; // Default
                             let titleClass = "text-stone-800";
                             let iconClass = "text-stone-300";
                             let containerClass = "";
                             
                             if (isAlert) {
                                 Icon = AlertCircle;
                                 themeClass = "prose-red prose-p:text-red-800/80 prose-strong:text-red-900"; 
                                 titleClass = "text-red-800";
                                 iconClass = "text-red-400";
                                 containerClass = "bg-red-50/30 -mx-4 px-4 py-4 rounded-xl"; // Subtle highlight for alerts
                             } else if (isStar) {
                                 Icon = Sparkles;
                                 themeClass = "prose-amber prose-p:text-amber-900/80 prose-strong:text-amber-900";
                                 titleClass = "text-amber-800";
                                 iconClass = "text-amber-400";
                                 containerClass = "bg-amber-50/20 -mx-4 px-4 py-4 rounded-xl";
                             } else {
                                 themeClass = "prose-stone prose-p:text-stone-600 prose-strong:text-stone-800";
                                 titleClass = "text-school-board";
                                 iconClass = "text-stone-300";
                             }
                             
                             return (
                                <div key={idx} className={`relative group ${containerClass}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 flex-shrink-0 ${iconClass}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold font-hand mb-2 ${titleClass}`}>{section.title}</h3>
                                            <div className={`${themeClass} max-w-none`}>
                                                <MarkdownRenderer content={section.content} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Footer decoration */}
                    <div className="relative z-10 mt-12 pt-8 border-t border-dashed border-stone-200 text-center flex flex-col items-center gap-2">
                        <span className="text-xs font-hand text-stone-300">تم إنشاء هذا الملخص بواسطة منصة LMS</span>
                        <div className="flex items-center gap-1 text-[10px] text-stone-300 font-mono">
                            <span>LMS.EDU.SA</span> • <span>{new Date().getFullYear()}</span>
                        </div>
                    </div>
                </PaperCard>
            </div>
        );
    }

    return <div className="p-8 text-center text-stone-400">لا يوجد محتوى متاح</div>;
};

const ChallengeStage = ({ content, quizState, onSelectAnswer }: { content: any, quizState: any, onSelectAnswer: (i: number) => void }) => {
    const questions = content?.questions || (content?.question ? [content] : []);
    const [isDownloading, setIsDownloading] = useState(false);
    
    if (questions.length === 0) return null;

    const handleDownloadPDF = async () => {
        const element = document.getElementById('quiz-results-card');
        if (!element) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('quiz-results-card');
                    if (clonedElement) {
                        // 1. Enable full height and overflow
                        clonedElement.style.height = 'auto';
                        clonedElement.style.overflow = 'visible';
                        
                        // 2. Hide actions in PDF
                        const actions = clonedElement.querySelector('#quiz-actions');
                        if (actions) (actions as HTMLElement).style.display = 'none';

                        // 3. Fix text truncation and overlap
                        const truncatedElements = clonedElement.querySelectorAll('.truncate');
                        truncatedElements.forEach((el) => {
                            el.classList.remove('truncate');
                            el.classList.add('whitespace-normal');
                            el.classList.add('h-auto');
                        });

                        // 4. Ensure option containers can grow
                        const optionContainers = clonedElement.querySelectorAll('.grid > div');
                        optionContainers.forEach((el) => {
                            (el as HTMLElement).style.height = 'auto';
                            (el as HTMLElement).style.minHeight = 'auto';
                        });
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width mm
            const pageHeight = 295; // A4 height mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            let heightLeft = imgHeight;
            let position = 0;

            // First Page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Subsequent Pages
            while (heightLeft >= 0) {
                position -= 295; // Move cursor up
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save('LMS-Quiz-Results.pdf');
        } catch (error) {
            console.error('PDF Error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    // REVIEW MODE (All Questions)
    if (quizState.isSubmitted) {
        const correctCount = questions.reduce((acc: number, q: any, idx: number) => {
            return acc + (quizState.answers[idx] === q.correctIndex ? 1 : 0);
        }, 0);
        const totalQuestions = questions.length;
        
        return (
            <div className="w-full flex justify-center pb-20 px-1 sm:px-0">
                <PaperCard id="quiz-results-card" className="p-4 sm:p-6 md:p-8 w-full max-w-4xl bg-white relative overflow-hidden mx-auto">
                    
                    {/* Result Header */}
                    <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border-2 ${correctCount === totalQuestions ? 'bg-green-50 border-green-100' : 'bg-stone-50 border-stone-100'}`}>
                                 {correctCount === totalQuestions ? <Sparkles size={24} className="text-green-500" /> : <Target size={24} className="text-school-board" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-hand text-stone-800">نتيجة الاختبار</h2>
                                <div className="flex items-center gap-1 text-sm text-stone-500 font-hand font-bold">
                                    <span>الدرجة:</span>
                                    <span className={correctCount === totalQuestions ? "text-green-600" : "text-school-board"}>{correctCount}</span>
                                    <span>من</span>
                                    <span>{totalQuestions}</span>
                                </div>
                            </div>
                        </div>

                        <div id="quiz-actions" className="print:hidden">
                             <button 
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-600 transition-colors disabled:opacity-50 text-xs font-bold font-hand"
                             >
                                 {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                 <span>{isDownloading ? 'جاري التحميل...' : 'تحميل النتائج'}</span>
                             </button>
                        </div>
                    </div>

                    {/* Review List - Compact */}
                    <div className="space-y-4 relative z-10">
                        {questions.map((q: any, qIdx: number) => {
                            const userAnswer = quizState.answers[qIdx];
                            const isCorrect = userAnswer === q.correctIndex;
                            
                            return (
                                <div key={qIdx} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50/10' : 'border-red-200 bg-red-50/10'}`}>
                                    {/* Question Header */}
                                    <div className="flex gap-2 mb-3">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center font-bold font-hand text-xs ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                            {qIdx + 1}
                                        </span>
                                        <h4 className="text-base font-bold text-stone-800 font-hand leading-snug pt-0.5">
                                            {q.question}
                                        </h4>
                                    </div>

                                    {/* Options Grid (2 Columns) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 pr-8">
                                        {q.options?.map((opt: string, optIdx: number) => {
                                            const isSelected = userAnswer === optIdx;
                                            const isTarget = optIdx === q.correctIndex;
                                            
                                            let style = "border-stone-100 bg-white text-stone-500";
                                            let icon = null;

                                            if (isTarget) {
                                                style = "border-green-200 bg-green-50 text-green-800 font-bold shadow-sm";
                                                icon = <CheckCircle size={12} className="text-green-600" />;
                                            } else if (isSelected && !isCorrect) {
                                                style = "border-red-200 bg-red-50 text-red-800 line-through decoration-red-300 opacity-80";
                                                icon = <X size={12} className="text-red-500" />;
                                            } else if (isSelected) { // Correct selection handled above, this is fallback
                                                style = "border-stone-800 bg-stone-50 text-stone-800"; 
                                            }
                                            
                                            return (
                                                <div key={optIdx} className={`px-2.5 py-1.5 rounded border text-xs font-hand flex items-center justify-between gap-2 ${style}`}>
                                                    <span className="truncate">{opt}</span>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Explanation - Compact */}
                                    <div className="pr-8">
                                        <div className="text-xs p-2 rounded bg-stone-50/80 border border-stone-100 text-stone-600 flex items-start gap-1.5">
                                            <Lightbulb size={12} className="mt-0.5 flex-shrink-0 opacity-70 text-amber-500" />
                                            <p className="font-hand leading-relaxed opacity-90">{q.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                </PaperCard>
            </div>
        );
    }

    // ACTIVE MODE (Single Question)
    const currentQuestion = questions[quizState.currentIndex];
    const totalQuestions = questions.length;
    
    return (
        <div className="w-full flex justify-center px-1 sm:px-0">
            <PaperCard className="p-4 sm:p-6 md:p-12 w-full max-w-4xl min-h-[500px] bg-white relative overflow-hidden mx-auto">
                
                {/* Header */}
                <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
                    <h2 className="text-2xl font-bold font-hand text-stone-800">اختبار سريع</h2>
                    
                    <div className="flex items-center gap-4 text-xs font-mono text-stone-400">
                        <span>{new Date().toLocaleDateString('en-GB')}</span>
                        <div className="h-4 w-px bg-stone-200" />
                        <span className="font-bold">سؤال {quizState.currentIndex + 1} من {totalQuestions}</span>
                    </div>
                </div>
                
                {/* Question Area */}
                <div className="relative z-10 mb-6 min-h-[80px]">
                    <div className="flex gap-3">
                        <span className="text-lg font-bold text-stone-300 font-hand pt-1">0{quizState.currentIndex + 1}</span>
                        <h4 className="text-lg text-stone-800 font-bold leading-relaxed font-hand animate-in fade-in slide-in-from-right-4 duration-300" key={quizState.currentIndex}>
                           {currentQuestion.question}
                        </h4>
                    </div>
                </div>
                
                {/* Options Area */}
                <div className="relative z-10 space-y-3 max-w-2xl mx-auto min-h-[200px]">
                    {currentQuestion.options?.map((opt: string, i: number) => {
                        const isSelected = quizState.answers[quizState.currentIndex] === i;
                        
                        let containerStyle = "border-stone-200 hover:bg-stone-50 cursor-pointer";
                        let checkStyle = "border-stone-300 text-transparent";
                        
                        if (isSelected) {
                            containerStyle = "border-stone-800 bg-stone-50 shadow-[1px_1px_0px_#292524]";
                            checkStyle = "border-stone-800 bg-stone-800 text-white";
                        }

                        return (
                            <button 
                                key={i}
                                onClick={() => onSelectAnswer(i)}
                                className={`w-full text-right px-4 py-3 rounded-md border transition-all font-hand text-base text-stone-700 flex items-center gap-3 group ${containerStyle}`}
                            >
                                <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors ${checkStyle}`}>
                                    {isSelected && <CheckCircle size={10} strokeWidth={4} />}
                                </div>
                                <span className="font-medium pt-0.5">{opt}</span>
                            </button>
                        );
                    })}
                </div>

                {/* NOTE: No Internal Navigation Buttons Here - Controlled by Parent Footer */}

            </PaperCard>
        </div>
    );
};

const TakeawayStage = ({ content, onFinish }: { content: any, onFinish: () => void }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadCheatSheet = async () => {
        const element = document.getElementById('cheat-sheet-card');
        if (!element) return;

        setIsDownloading(true);
        try {
            const actions = element.querySelector('#sheet-actions');
            if (actions) (actions as HTMLElement).style.display = 'none';

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#fffdfa',
                useCORS: true
            });

            if (actions) (actions as HTMLElement).style.display = 'flex';

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('LMS-CheatSheet.pdf');
        } catch (error) {
            console.error('PDF Error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full flex justify-center px-1 sm:px-0">
            <PaperCard id="cheat-sheet-card" className="p-4 sm:p-8 md:p-12 w-full max-w-4xl min-h-[500px] bg-[#fffdfa] relative overflow-hidden mx-auto">
                
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none z-0">
                    <div className="flex flex-col items-center transform -rotate-45">
                        <GraduationCap size={400} />
                        <span className="text-6xl font-black mt-8 uppercase tracking-widest">CHEAT SHEET</span>
                    </div>
                </div>

                {/* Header: Cheat Sheet Style */}
                <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b-4 border-double border-stone-200">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-stone-800 text-white rounded-lg flex items-center justify-center shadow-md transform rotate-3">
                            <span className="font-black text-2xl">TL;DR</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold font-hand text-stone-800">ورقة المراجعة</h2>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">خلاصة ما تعلمته</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleDownloadCheatSheet}
                        disabled={isDownloading}
                        className="print:hidden flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-600 transition-colors text-xs font-bold disabled:opacity-50"
                    >
                        {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        <span>حفظ الملخص</span>
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Key Points Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star size={18} className="text-amber-500 fill-amber-500" />
                            <h3 className="font-bold font-hand text-stone-700">ماذا فهمنا؟</h3>
                        </div>
                        
                        {content?.keyPoints?.map((point: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-stone-200 shadow-sm hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                                <span className="text-amber-500 font-bold text-lg leading-none mt-1">•</span>
                                <p className="font-hand font-medium text-stone-700 text-sm leading-relaxed">{point}</p>
                            </div>
                        ))}
                    </div>

                    {/* Actionable Rules Column */}
                    <div className="space-y-6">
                        {/* Golden Rule Box */}
                        <div className="bg-stone-800 text-white p-5 rounded-xl shadow-lg transform rotate-1">
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Lock size={12} />
                                القاعدة الذهبية
                            </h3>
                            <p className="font-hand text-lg leading-relaxed font-bold">
                                "تذكر دائماً أن الفهم العميق يأتي من التطبيق، وليس من الحفظ المجرد. اربط كل معلومة بمثال واقعي."
                            </p>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-stone-50 p-5 rounded-xl border-2 border-dashed border-stone-200">
                            <h3 className="font-bold font-hand text-stone-600 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                                <ArrowRight size={14} />
                                الخطوات التالية
                            </h3>
                            <ul className="space-y-2">
                                <li className="text-sm text-stone-600 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border border-stone-300 bg-white" />
                                    <span>راجع المصطلحات في الصفحة الأولى</span>
                                </li>
                                <li className="text-sm text-stone-600 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border border-stone-300 bg-white" />
                                    <span>طبق المفهوم في مسألة عملية</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Finish Button Area */}
                <div id="sheet-actions" className="relative z-10 mt-10 pt-6 border-t border-stone-100 flex justify-center print:hidden">
                    <BrandButton onClick={onFinish} className="w-full md:w-auto px-12 py-3 shadow-md text-lg" variant="primary">
                        إنهاء الدرس والعودة للخريطة
                        <ArrowLeft size={20} />
                    </BrandButton>
                </div>

            </PaperCard>
        </div>
    );
};

// --- 4. MAIN COMPONENT ---

export function CourseMap() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // UI State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [activeTopicId, setActiveTopicId] = useState<string | null>(() => {
        // Initialize from local storage if available for this file
        if (fileId) {
            return localStorage.getItem(`lms_last_topic_${fileId}`);
        }
        return null;
    });

    // Save active topic to local storage whenever it changes
    useEffect(() => {
        if (fileId) {
            if (activeTopicId) {
                localStorage.setItem(`lms_last_topic_${fileId}`, activeTopicId);
            } else {
                // Optional: Clear if null, but maybe better to keep last known state? 
                // Let's keep it to allow "resuming" even if deselected momentarily
            }
        }
    }, [activeTopicId, fileId]);
    
    // State Persistence for Sidebar
    const [isMapOpen, setIsMapOpen] = useState(() => {
        // ALWAYS open on larger screens initially, regardless of previous history
        // This ensures the sidebar is visible on iPad/Desktop by default
        if (window.innerWidth >= 768) return true;
        
        // On mobile, check storage or default to closed
        const saved = localStorage.getItem('lms_course_map_open');
        if (saved !== null) return saved === 'true';
        
        return false;
    });

    const toggleMap = (newState: boolean) => {
        setIsMapOpen(newState);
        localStorage.setItem('lms_course_map_open', String(newState));
    };

    // Quiz State (Lifted Up)
    const [quizState, setQuizState] = useState({
        currentIndex: 0,
        answers: {} as Record<number, number>,
        isSubmitted: false
    });

    // Generation State
    const [generationStatus, setGenerationStatus] = useState<{
        state: 'idle' | 'generating_topics' | 'generating_content';
        progress: number;
        total: number;
        currentTopic?: string;
        currentStep?: string;
    }>({ state: 'idle', progress: 0, total: 0 });

    // --- DATA ---
    const { data: fullResource, isLoading: isResourceLoading } = useQuery({
        queryKey: ['resource', fileId],
        queryFn: () => resourceService.getOne(fileId!),
        enabled: !!fileId
    });

    // --- LOADING SCREEN (Empty State) ---
    const isProcessing = localStorage.getItem(`processing_resource_${fileId}`) === 'true';

    const { data: topics = [], isLoading: isTopicsLoading } = useQuery({
        queryKey: ['topics', fileId],
        queryFn: async () => {
            try {
                const data = await resourceService.getTopics(fileId!);
                return Array.isArray(data) ? data : [];
            } catch (e) { return []; }
        },
        enabled: !!fileId && !!fullResource,
        // Poll every 2 seconds if processing or if we have no topics yet but expecting them
        refetchInterval: (data) => {
            if (isProcessing) return 2000;
            if (!data || data.length === 0) return 2000; 
            return false;
        }
    });

    // Reset Quiz on Topic Change
    useEffect(() => {
        setQuizState({ currentIndex: 0, answers: {}, isSubmitted: false });
    }, [activeTopicId]);

    // Scroll to top on step change
    useEffect(() => {
        const mainContent = document.querySelector('main');
        if (mainContent) mainContent.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [currentStepIndex, activeTopicId, quizState.currentIndex, quizState.isSubmitted]);

    // Handle Mobile/Desktop Drawer State (Only initial check if not set)
    useEffect(() => {
        const handleResize = () => {
            // Only auto-collapse if user hasn't explicitly set a preference
            const saved = localStorage.getItem('lms_course_map_open');
            if (saved === null) {
                // < 768px (Mobile) -> Closed, >= 768px (Tablet/Desktop) -> Open
                setIsMapOpen(window.innerWidth >= 768);
            }
        };
        // handleResize(); // Don't run on init, we used lazy state initialization
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeTopic = topics.find((t: Topic) => t.id === activeTopicId);
    const currentStep = STEPS_ORDER[currentStepIndex];
    const stepConfig = STEP_DETAILS[currentStep];

    // Step Content
    const { data: stepContent, isLoading: isStepLoading, isError: isStepError, refetch: refetchStep } = useQuery({
        queryKey: ['stepContent', activeTopicId, currentStep],
        queryFn: async () => {
            if (!activeTopicId || !stepConfig.apiType) return null;
            try {
                return await lessonsService.getStepContent(activeTopicId, stepConfig.apiType);
            } catch (e) { 
                throw e; 
            }
        },
        enabled: !!activeTopicId && !!stepConfig.apiType,
        staleTime: Infinity,
        retry: 1
    });

    // --- INTELLIGENT PRE-FETCHING ---
    useEffect(() => {
        if (!activeTopicId || !topics.length) return;

        // 1. Eagerly load ALL steps for current topic immediately
        const steps: ('intro' | 'explanation' | 'question' | 'outro')[] = ['intro', 'explanation', 'question', 'outro'];
        
        steps.forEach(stepType => {
            // Check if already in cache to avoid spamming
            const cacheKey = ['stepContent', activeTopicId, stepType];
            const state = queryClient.getQueryState(cacheKey);
            if (!state || state.isInvalidated || (!state.data && !state.isFetching)) {
                queryClient.prefetchQuery({
                    queryKey: cacheKey,
                    queryFn: () => lessonsService.getStepContent(activeTopicId, stepType),
                    staleTime: Infinity
                });
            }
        });

        // 2. Background Load Next Topics (Sequential)
        const currentIdx = topics.findIndex((t: Topic) => t.id === activeTopicId);
        if (currentIdx !== -1 && currentIdx < topics.length - 1) {
            
            // Wait a bit to let the current topic load first (prioritize UX)
            const timeoutId = setTimeout(() => {
                const nextTopic = topics[currentIdx + 1];
                console.log(`[Smart Pre-fetch] Starting background load for next topic: ${nextTopic.title}`);
                
                steps.forEach(stepType => {
                    queryClient.prefetchQuery({
                        queryKey: ['stepContent', nextTopic.id, stepType],
                        queryFn: () => lessonsService.getStepContent(nextTopic.id, stepType),
                        staleTime: Infinity
                    });
                });

                // If there's a topic after that, queue it too (less priority)
                if (currentIdx < topics.length - 2) {
                    const nextNextTopic = topics[currentIdx + 2];
                    setTimeout(() => {
                         steps.forEach(stepType => {
                            queryClient.prefetchQuery({
                                queryKey: ['stepContent', nextNextTopic.id, stepType],
                                queryFn: () => lessonsService.getStepContent(nextNextTopic.id, stepType),
                                staleTime: Infinity
                            });
                        });
                    }, 5000);
                }

            }, 3000); // 3s delay

            return () => clearTimeout(timeoutId);
        }

    }, [activeTopicId, topics, queryClient]);

    const generateTopicsMutation = useMutation({
        mutationFn: () => resourceService.generateTopics(fileId!),
        onMutate: () => {
            setGenerationStatus({ state: 'generating_topics', progress: 0, total: 100 });
        },
        onSuccess: async (data: any) => {
             // 1. Optimistic Update
             queryClient.setQueryData(['topics', fileId], data);
             
             const topics = data as Topic[];
             if (!topics || topics.length === 0) {
                 setGenerationStatus({ state: 'idle', progress: 0, total: 0 });
                 return;
             }

             // 2. Start Generating Content Sequentially
             const stepTypes: ('intro' | 'explanation' | 'question' | 'outro')[] = ['intro', 'explanation', 'question', 'outro'];
             const totalSteps = topics.length * stepTypes.length;
             
             setGenerationStatus({ 
                 state: 'generating_content', 
                 progress: 0, 
                 total: totalSteps 
             });

             let completedCount = 0;
             
             for (const topic of topics) {
                 for (const type of stepTypes) {
                     setGenerationStatus(prev => ({
                         ...prev,
                         currentTopic: topic.title,
                         currentStep: type === 'intro' ? 'المقدمة' : type === 'explanation' ? 'الزبدة' : type === 'question' ? 'الأسئلة' : 'الخاتمة'
                     }));

                     try {
                         // Fetching triggers generation if missing
                         await lessonsService.getStepContent(topic.id, type);
                     } catch (e) {
                         console.error(`Failed to generate ${type} for ${topic.title}`, e);
                     }

                     completedCount++;
                     setGenerationStatus(prev => ({
                         ...prev,
                         progress: completedCount
                     }));
                 }
             }
             
             // 3. Finish
             setGenerationStatus({ state: 'idle', progress: 0, total: 0 });
             queryClient.invalidateQueries({ queryKey: ['topics', fileId] });
             queryClient.invalidateQueries({ queryKey: ['resource', fileId] });
        },
        onError: () => {
            setGenerationStatus({ state: 'idle', progress: 0, total: 0 });
        }
    });

    // --- LOGIC ---
    
    // Derived Quiz Info
    const quizQuestions = (currentStep === 'challenge' && stepContent) 
        ? (stepContent.questions || (stepContent.question ? [stepContent.question] : [])) 
        : [];
    const isQuizActive = currentStep === 'challenge' && quizQuestions.length > 0;

    const handleNext = () => {
        // QUIZ LOGIC INTERCEPTION
        if (isQuizActive) {
            if (!quizState.isSubmitted) {
                const isLast = quizState.currentIndex === quizQuestions.length - 1;
                if (isLast) {
                    // Submit
                    setQuizState(prev => ({ ...prev, isSubmitted: true }));
                } else {
                    // Next Question
                    setQuizState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
                }
                return;
            }
            // If submitted, let it fall through to normal logic (move to Takeaway)
        }

        if (currentStepIndex < STEPS_ORDER.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // Finish - Go back to Overview (Empty State)
            setActiveTopicId(null);
            setCurrentStepIndex(0);
        }
    };

    const handlePrev = () => {
        // QUIZ LOGIC INTERCEPTION
        if (isQuizActive && !quizState.isSubmitted && quizState.currentIndex > 0) {
            setQuizState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
            return;
        }

        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Calculate Button State
    let nextBtnText = currentStep === 'takeaway' ? 'إنهاء' : 'التالي';
    let nextBtnIcon = ArrowLeft;
    let nextBtnDisabled = false;

    if (isQuizActive && !quizState.isSubmitted) {
        const isLast = quizState.currentIndex === quizQuestions.length - 1;
        const hasAnsweredCurrent = quizState.answers[quizState.currentIndex] !== undefined;
        
        nextBtnDisabled = !hasAnsweredCurrent;
        if (isLast) {
            nextBtnText = "تحقق"; 
            nextBtnIcon = CheckCircle;
        }
    }

    // --- LOADING SCREEN (Empty State) ---
    // Moved up to be used in useQuery
    // const isProcessing = localStorage.getItem(`processing_resource_${fileId}`) === 'true';

    // Clear processing flag if topics arrive
    useEffect(() => {
        if (topics.length > 0 && isProcessing) {
            localStorage.removeItem(`processing_resource_${fileId}`);
        }
    }, [topics, isProcessing, fileId]);

    // 1. Initial Loading or Processing State
    if (isResourceLoading || (topics.length === 0 && isProcessing)) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#F5F5F0] min-h-[500px]">
                 <BrandSkeleton type="general" message="جاري تجهيز خريطة المسار..." />
            </div>
        );
    }

    // 2. Generating Topics State (Explicit)
    if (generationStatus.state === 'generating_topics' && topics.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#F5F5F0]">
                 <BrandSkeleton type="general" message="جاري استخراج المواضيع..." />
            </div>
        );
    }

    // 3. Empty State (No Topics & Not Processing)
    if ((isTopicsLoading || topics.length === 0) && generationStatus.state === 'idle') {
         if (isTopicsLoading) {
             return (
                <div className="h-full w-full flex items-center justify-center bg-[#F5F5F0]">
                     <BrandSkeleton type="general" />
                </div>
            );
         }

         return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                <div className="max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-stone-100 shadow-xl mx-auto">
                        <MapIcon size={32} className="text-school-board" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 font-hand">رحلة التعلم</h2>
                    <p className="text-stone-500 font-hand text-lg">لم يتم توليد المواضيع لهذا الملف بعد.</p>
                    
                    <BrandButton 
                        onClick={() => generateTopicsMutation.mutate()} 
                        disabled={generationStatus.state !== 'idle'}
                        className="w-full justify-center shadow-lg"
                        variant="primary"
                    >
                         <Sparkles size={20} /> استخراج المواضيع وبدء الرحلة
                    </BrandButton>
                </div>
            </div>
        );
    }

    // --- LESSON MODE LAYOUT ---
    return (
        <div className="h-full w-full flex bg-[#F5F5F0] overflow-hidden relative" dir="rtl">
            
            {/* 1. Map Drawer */}
            <motion.div 
                initial={false}
                animate={{ width: isMapOpen ? 240 : 0, opacity: isMapOpen ? 1 : 0 }}
                className="flex-shrink-0 bg-white border-l border-stone-200 shadow-lg relative z-20 overflow-hidden flex flex-col"
                style={{ width: isMapOpen ? 240 : 0 }}
            >
                <div className="p-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between min-w-[240px]">
                    <h3 className="font-hand font-bold text-stone-700 flex items-center gap-2 text-sm">
                        <MapIcon size={16} className="text-school-board" />
                        خريطة المسار
                    </h3>
                    <button onClick={() => toggleMap(false)} className="text-stone-400 hover:text-stone-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 min-w-[240px]">
                    {topics.map((topic: Topic, idx: number) => {
                        const isActive = activeTopicId === topic.id;
                        return (
                            <button 
                                key={topic.id}
                                onClick={() => { setActiveTopicId(topic.id); setCurrentStepIndex(0); if(window.innerWidth < 1024) toggleMap(false); }}
                                className={`w-full text-right p-3 rounded-xl border-2 transition-all relative overflow-hidden group ${
                                    isActive 
                                    ? 'bg-white border-school-board shadow-sm' 
                                    : 'bg-white border-stone-100 hover:border-stone-300 opacity-80 hover:opacity-100'
                                }`}
                            >
                                {isActive && <div className="absolute top-0 right-0 bottom-0 w-1 bg-school-board" />}
                                
                                <div className="flex justify-between items-start pl-1 mb-1">
                                    <span className={`font-bold font-hand text-sm leading-tight line-clamp-2 ${isActive ? 'text-school-board' : 'text-stone-700'}`}>
                                        {topic.title}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase">
                                    <span className="flex items-center gap-1 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                                        <Clock size={10} /> {topic.timeEstimate.replace(/mins?|minutes?/gi, 'دقيقة').replace(/hours?|hrs?/gi, 'ساعة')}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded border ${
                                        (topic.difficulty === 'Hard' || topic.difficulty === 'صعب') ? 'bg-red-50 text-red-400 border-red-100' : 
                                        (topic.difficulty === 'Medium' || topic.difficulty === 'متوسط') ? 'bg-yellow-50 text-yellow-500 border-yellow-100' :
                                        'bg-green-50 text-green-500 border-green-100'
                                    }`}>
                                        {(topic.difficulty === 'Hard' || topic.difficulty === 'صعب') ? 'صعب' : (topic.difficulty === 'Medium' || topic.difficulty === 'متوسط') ? 'متوسط' : 'سهل'}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                
                {/* Header */}
                <header className="h-14 bg-white/80 backdrop-blur border-b border-stone-200 flex items-center justify-between px-4 z-10 relative">
                    <div className="flex items-center gap-3 relative">
                        {!isMapOpen && (
                            <div className="relative">
                                <button 
                                    onClick={() => toggleMap(true)} 
                                    className={`
                                        p-2 bg-white border border-stone-200 rounded-lg text-stone-500 hover:text-school-board hover:border-school-board transition-all shadow-sm
                                        ${!activeTopic ? 'animate-pulse ring-4 ring-school-board/20 border-school-board/50 text-school-board' : ''}
                                    `}
                                >
                                    <Menu size={18} />
                                </button>
                                
                                {/* Helper Arrow for Empty State */}
                                {!activeTopic && (
                                    <div className="absolute top-14 -left-16 z-50 pointer-events-none">
                                        <style>
                                            {`
                                            @keyframes float-arrow {
                                                0%, 100% { transform: translateY(0); }
                                                50% { transform: translateY(-8px); }
                                            }
                                            `}
                                        </style>
                                        <div className="relative flex flex-col items-center" style={{ animation: 'float-arrow 3s ease-in-out infinite' }}>
                                            {/* Hand-drawn Arrow SVG Pointing UP - LARGER */}
                                            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-school-board transform rotate-6 mb-1">
                                                {/* Arrow pointing UP from bottom-left to top-right (relative to box) */}
                                                <path d="M15 45 Q25 25 40 5 M40 5 L30 5 M40 5 L42 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="text-xs font-bold font-hand text-school-board transform -rotate-6 w-24 text-center leading-tight">
                                                اضغط هنا<br/>لفتح القائمة
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="font-hand font-bold text-stone-800 text-xs min-[400px]:text-sm md:text-base line-clamp-2 leading-tight max-w-[100px] min-[360px]:max-w-[130px] min-[400px]:max-w-[200px] sm:max-w-md" title={activeTopic ? activeTopic.title : ''}>
                                {activeTopic ? activeTopic.title : 'خريطة المسار'}
                            </h1>
                            <span className="text-[9px] min-[400px]:text-[10px] font-bold text-stone-400 leading-none mt-0.5">
                                {activeTopic ? `الدرس ${topics.findIndex(t => t.id === activeTopicId) + 1} من ${topics.length}` : 'نظرة عامة'}
                            </span>
                        </div>
                    </div>

                    {/* Steps Pills */}
                    {activeTopic && (
                        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
                            {STEPS_ORDER.map((step) => {
                                const isActive = step === currentStep;
                                const details = STEP_DETAILS[step];
                                const Icon = details.icon;
                                
                                return (
                                    <button
                                        key={step}
                                        onClick={() => setCurrentStepIndex(STEPS_ORDER.indexOf(step))}
                                        className={`
                                            p-1.5 md:px-3 md:py-1.5 rounded-md flex items-center gap-2 transition-all
                                            ${isActive ? 'bg-white text-school-board shadow-sm' : 'text-stone-400 hover:text-stone-600'}
                                        `}
                                        title={details.label}
                                    >
                                        <Icon size={16} />
                                        <span className="hidden md:inline font-hand font-bold text-xs">{details.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </header>

                {/* Content Stage */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 md:p-6 pb-32 w-full flex flex-col items-center max-w-full overflow-x-hidden">
                    {!activeTopic ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400 animate-in fade-in zoom-in-95 duration-500 w-full">
                            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                                <MapIcon size={40} className="text-stone-300" />
                            </div>
                            <h2 className="text-2xl font-bold font-hand text-stone-600 mb-2">اختر درساً من الخريطة للبدء</h2>
                            <p className="font-hand text-stone-400">رحلتك التعليمية تبدأ بخطوة واحدة</p>
                        </div>
                    ) : (
                        <div className={`w-full max-w-5xl flex-1 flex flex-col min-h-[auto] md:min-h-[500px] ${(currentStep === 'context' || (currentStep === 'challenge' && !quizState.isSubmitted)) ? 'justify-start py-4 md:justify-center md:py-0' : ''}`}>
                            <div className="w-full flex justify-center">
                                {isStepLoading ? (
                                    <div className="w-full flex justify-center py-8">
                                         <BrandSkeleton type="lesson" hideMessage={true} />
                                    </div>
                                ) : (isStepError || !stepContent) ? (
                                    <div className="w-full flex justify-center py-8">
                                         <PaperCard className="p-12 w-full max-w-3xl min-h-[400px] flex flex-col items-center justify-center text-center">
                                             <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
                                                 <AlertCircle size={32} />
                                             </div>
                                             <h3 className="text-xl font-bold font-hand text-stone-600 mb-2">المحتوى غير جاهز</h3>
                                             <p className="text-stone-500 font-hand mb-6">لم نتمكن من جلب محتوى هذا الدرس. قد يكون قيد التوليد الآن.</p>
                                             <BrandButton onClick={() => refetchStep()} variant="secondary" size="small">
                                                 <RefreshCw size={16} /> إعادة المحاولة
                                             </BrandButton>
                                         </PaperCard>
                                     </div>
                                ) : (
                                    <>
                                        {currentStep === 'context' && <ContextStage content={stepContent} />}
                                        {currentStep === 'core' && <CoreStage content={stepContent} />}
                                        {currentStep === 'challenge' && (
                                            <ChallengeStage 
                                                content={stepContent} 
                                                quizState={quizState}
                                                onSelectAnswer={(idx) => setQuizState(prev => ({
                                                    ...prev,
                                                    answers: { ...prev.answers, [prev.currentIndex]: idx }
                                                }))}
                                            />
                                        )}
                                        {currentStep === 'takeaway' && <TakeawayStage content={stepContent} onFinish={() => setActiveTopicId(null)} />}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </main>

                {/* Floating Navigation Dock */}
                {activeTopic && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 md:bottom-6">
                        <div className="bg-white/90 backdrop-blur-md border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-1.5 flex items-center justify-between gap-2">
                            <button 
                                onClick={handlePrev} 
                                disabled={currentStepIndex === 0 && (!isQuizActive || quizState.currentIndex === 0)}
                                className="p-3 rounded-xl hover:bg-stone-100 text-stone-500 disabled:opacity-30 transition-all active:scale-95"
                            >
                                <ArrowRight size={20} />
                            </button>

                            <div className="flex flex-col items-center">
                                <span className="font-hand font-bold text-stone-800 text-sm">{stepConfig.label}</span>
                                <div className="flex gap-1 mt-0.5">
                                    {STEPS_ORDER.map((_, i) => (
                                        <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === currentStepIndex ? 'bg-school-board w-3' : 'bg-stone-300'}`} />
                                    ))}
                                </div>
                            </div>

                            <BrandButton 
                                onClick={handleNext}
                                disabled={nextBtnDisabled}
                                className="h-10 px-4 text-sm shadow-sm"
                                variant="primary"
                                size="small"
                            >
                                <span className="font-bold font-hand hidden sm:inline">{nextBtnText}</span>
                                {React.createElement(nextBtnIcon, { size: 16 })}
                            </BrandButton>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default CourseMap;
