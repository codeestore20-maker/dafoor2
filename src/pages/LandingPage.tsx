import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  Zap, 
  ChevronDown
} from 'lucide-react';
import { HandArrow, HandCircle, HandUnderline, Scribble, ChalkCharacter, HandBulb, HandBook, HandPencil, HandChat } from '../components/shared/Doodles';
import { IndexCard } from '../components/shared/IndexCard';

export function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#fffdf5] text-stone-800 font-hand overflow-x-hidden selection:bg-school-board/20">
      
      {/* Background Texture - Simplified */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Grid Background - Subtle */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0" 
           style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <img src="/favicon.png" alt="Dafoor Ai" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <span className="text-2xl font-bold hidden sm:block text-stone-700">دافور</span>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/login')}
                className="text-stone-600 hover:text-stone-900 font-bold text-sm sm:text-base transition-colors"
            >
                دخول
            </button>
            <button 
                onClick={() => navigate('/register')}
                className="bg-stone-800 text-[#fffdf5] px-5 py-2 rounded-xl font-bold text-sm sm:text-base shadow-sm hover:bg-stone-700 hover:shadow-md transition-all transform hover:-translate-y-0.5 border border-stone-900"
            >
                جرب مجاناً
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-10 md:pt-16 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col items-center gap-10 md:gap-16">
        
        {/* Text Content */}
        <div className="w-full max-w-3xl text-center space-y-6 flex flex-col items-center z-20">
            <div className="inline-block relative mb-6 w-full">
                {/* Beta Badge - Responsive Positioning */}
                <motion.div 
                    initial={{ opacity: 0, rotate: -10 }}
                    animate={{ opacity: 1, rotate: -6 }}
                    className="
                        inline-block md:absolute 
                        mb-4 md:mb-0
                        md:-top-12 md:-right-16 
                        text-school-board font-bold text-xs md:text-sm 
                        border border-school-board/20 bg-[#e6f0ee]/80 
                        rounded-lg px-3 py-1.5
                        transform md:rotate-6 
                        shadow-sm backdrop-blur-sm
                    "
                >
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        إطلاق تجريبي
                    </span>
                </motion.div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight relative z-10 flex flex-wrap justify-center gap-x-3 gap-y-2 items-center">
                    <span className="text-stone-800">الاختبارات بجيبك..</span>
                    
                    {/* Animated Dafoor AI Highlight */}
                    <div className="relative inline-block px-3 py-1 group cursor-default">
                        {/* Animated Scribble Background */}
                        <svg className="absolute inset-0 w-full h-full -z-10 text-yellow-300 overflow-visible transform scale-[0.85]" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <motion.path 
                                d="M5,55 Q25,45 50,55 T95,55 L95,65 Q75,75 50,65 T5,65 L5,55 Z" 
                                fill="currentColor"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                            />
                            <motion.path 
                                d="M10,50 Q30,40 50,50 T90,50" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="60" 
                                strokeLinecap="round"
                                className="opacity-40 mix-blend-multiply"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                            />
                        </svg>
                        
                        <span className="font-hand text-school-board relative z-10 drop-shadow-sm">مع دافور AI</span>
                    </div>
                </h1>
            </div>

            <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto px-4 font-medium">
                حوسة المذاكرة انتهت! دافور يفهمك، يلخص لك الكتاب، ويختبرك لين تتأكد إنك هضمت المادة.. خله يشيل عنك الحمل وركّز أنت على الإنجاز.
            </p>

            <div className="flex flex-row flex-wrap items-center justify-center gap-4 w-full sm:w-auto px-4 pt-4">
                <button 
                    onClick={() => navigate('/register')}
                    className="relative group bg-school-board text-white text-lg md:text-xl font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#2d5c55] transition-all transform hover:-translate-y-1 min-w-[140px] md:min-w-[180px]"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        جرب مجاناً
                        <ArrowRight className="rtl:rotate-180" size={20} />
                    </span>
                    {/* Sketchy Border Effect */}
                    <div className="absolute inset-0 border-2 border-stone-800 rounded-xl translate-x-1 translate-y-1 -z-0 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform"></div>
                </button>
                
                <p className="text-stone-500 text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2">
                    <Sparkles size={14} className="text-yellow-500" />
                    مجاناً بالكامل لفترة محدودة
                </p>
            </div>
        </div>

        {/* Hero Image / Visual - Hidden on Mobile */}
        <div className="relative w-full max-w-[1100px] mx-auto perspective-1000 px-2 md:px-0 hidden md:block">
            <div className="relative z-10 bg-white p-0 rounded-2xl md:rounded-[2rem] shadow-2xl transform rotate-1 border-[3px] border-stone-800 hover:rotate-0 transition-transform duration-500 overflow-hidden group">
                
                {/* Simulated App Interface - Natural Dimensions */}
                <div className="bg-stone-50 w-full relative">
                    <img src="/dashboard-preview.png" alt="Dafoor Dashboard" className="w-full h-auto block" />
                    
                    {/* Subtle Overlay Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                </div>
            </div>

            {/* Decorative Elements */}
            <HandArrow className="absolute -bottom-16 -right-8 md:-bottom-24 md:-right-16 w-24 h-24 md:w-40 md:h-40 text-stone-400 transform -rotate-[20deg]" />
            <Scribble className="absolute -top-16 -left-12 md:-top-24 md:-left-24 w-40 h-40 md:w-64 md:h-64 text-school-board/5 transform -rotate-12 pointer-events-none" />
        </div>
    </header>

    {/* Scroll Indicator */}
    <div className="flex justify-center pb-10">
        <button onClick={scrollToFeatures} className="animate-bounce text-stone-400 hover:text-stone-600 transition-colors">
            <ChevronDown size={32} />
        </button>
    </div>

    {/* Problem / Solution Section */}
    <section className="py-20 bg-white/50 border-t border-b border-stone-200/50 backdrop-blur-sm relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                {/* Problem */}
                <div className="text-center md:text-right space-y-4 max-w-sm opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-6xl mb-4">😫</div>
                    <h3 className="text-2xl font-bold text-stone-600 line-through decoration-red-500/50 decoration-4">تضيع وقتك في التلخيص؟</h3>
                    <p className="text-stone-500">ساعات طويلة تروح في قراءة كتب وملازم طويلة، وفي النهاية تنسى اللي قريته.</p>
                </div>

                <div className="hidden md:block text-stone-300">
                    <ArrowRight size={48} className="rtl:rotate-180" />
                </div>

                {/* Solution */}
                <div className="text-center md:text-right space-y-4 max-w-sm">
                    <div className="text-6xl mb-4 relative">
                        😎
                        <motion.div 
                            className="absolute -top-2 -right-2 text-yellow-500"
                            animate={{ rotate: [0, 20, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles size={32} fill="currentColor" />
                        </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800">ارفع ملفك.. وخذ الزبدة!</h3>
                    <p className="text-stone-600">ذكاء اصطناعي يحلل ملفاتك ويعطيك الملخص المهم، ويتوقع الأسئلة اللي بتجيك.</p>
                </div>
            </div>
        </div>
    </section>

    {/* Features Section - Green Sketchy Cards */}
    <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative overflow-hidden">
        
        <div className="text-center mb-20 space-y-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold inline-block relative">
                <span className="relative z-10 text-stone-800">ليش دافور؟</span>
                <HandUnderline className="absolute -bottom-2 left-0 right-0 h-3 text-school-board/40 w-full" />
            </h2>
            <p className="text-xl text-stone-500 font-medium max-w-2xl mx-auto">
                أدوات ذكية صممت خصيصاً عشان ترفع معدلك وتوفر وقتك
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* Feature 1 */}
            <div className="relative bg-school-board p-8 rounded-xl border-2 border-[#264f49] shadow-[6px_6px_0_0_#1e3d38] text-center md:text-right flex flex-col items-center md:items-start overflow-hidden group">
                {/* Notebook Line at the edge */}
                <div className="absolute top-0 right-8 w-[2px] h-full bg-black/10 hidden md:block"></div>

                {/* Dotted Pattern Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* Sketchy Decoration */}
                <div className="absolute -top-6 -left-6 opacity-10 transform rotate-12 group-hover:opacity-20 transition-opacity">
                     <Scribble className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10 flex flex-col h-full items-center md:items-start w-full">
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        <HandBook className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white relative inline-block">
                        التلخيص العميق
                        <HandUnderline className="absolute -bottom-2 left-0 w-full text-yellow-300/40 h-2" />
                    </h3>
                    <p className="text-stone-200 leading-relaxed font-medium">
                        لا تقرأ 100 صفحة.. اقرأ الزبدة. خوارزمياتنا تلخص لك المحتوى المهم وتبرز النقاط الرئيسية بذكاء.
                    </p>
                </div>
            </div>

            {/* Feature 2 */}
            <div className="relative bg-school-board p-8 rounded-xl border-2 border-[#264f49] shadow-[6px_6px_0_0_#1e3d38] text-center md:text-right flex flex-col items-center md:items-start overflow-hidden group">
                <div className="absolute top-0 right-8 w-[2px] h-full bg-black/10 hidden md:block"></div>

                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* Different Decoration */}
                <div className="absolute -bottom-8 -left-8 opacity-10 transform -rotate-12 group-hover:opacity-20 transition-opacity">
                     <HandCircle className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10 flex flex-col h-full items-center md:items-start w-full">
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 transform rotate-2 group-hover:rotate-0 transition-transform duration-300">
                        <HandPencil className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white relative inline-block">
                        توقع الاختبارات
                        <HandUnderline className="absolute -bottom-2 left-0 w-full text-yellow-300/40 h-2" />
                    </h3>
                    <p className="text-stone-200 leading-relaxed font-medium">
                        ذاكر الأسئلة قبل ما تدخل الاختبار. دافور يتوقع لك الأسئلة المحتملة بناءً على محتوى المادة بدقة عالية.
                    </p>
                </div>
            </div>

            {/* Feature 3 */}
            <div className="relative bg-school-board p-8 rounded-xl border-2 border-[#264f49] shadow-[6px_6px_0_0_#1e3d38] text-center md:text-right flex flex-col items-center md:items-start overflow-hidden group">
                <div className="absolute top-0 right-8 w-[2px] h-full bg-black/10 hidden md:block"></div>

                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
                </div>

                <div className="absolute top-10 -left-10 opacity-10 transform rotate-45 group-hover:opacity-20 transition-opacity">
                     <HandArrow className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10 flex flex-col h-full items-center md:items-start w-full">
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                        <HandChat className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white relative inline-block">
                        المعلم الذكي
                        <HandUnderline className="absolute -bottom-2 left-0 w-full text-yellow-300/40 h-2" />
                    </h3>
                    <p className="text-stone-200 leading-relaxed font-medium">
                        اسأل كتابك.. ويجاوبك. دردش مع ملفاتك واسأل عن أي جزئية مو فاهمها وشوف الشرح فوراً.
                    </p>
                </div>
            </div>

        </div>
    </section>

    {/* CTA / Footer Section */}
    <section className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto bg-stone-800 text-[#FFF8E7] rounded-3xl p-12 text-center relative shadow-2xl transform rotate-1">
            
            {/* Background Decorations within CTA */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold">جاهز ترفع معدلك؟</h2>
                <p className="text-xl text-stone-300 max-w-2xl mx-auto">
                    كن أول من يجرب مستقبل المذاكرة. التسجيل مجاني بالكامل خلال فترة الإطلاق التجريبي.
                </p>
                
                <button 
                    onClick={() => navigate('/register')}
                    className="inline-flex items-center gap-3 bg-[#FFF8E7] text-stone-900 text-xl font-bold px-10 py-4 rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all"
                >
                    <Zap className="text-yellow-500 fill-current" />
                    سجل الآن مجاناً
                </button>
            </div>
        </div>

        <footer className="mt-20 text-center text-stone-500 text-sm font-bold">
            <p>© {new Date().getFullYear()} دافور. صنع بحب للطلاب 🧡</p>
            <div className="flex justify-center gap-6 mt-4">
                <a href="#" className="hover:text-stone-800 transition-colors">تويتر</a>
                <a href="#" className="hover:text-stone-800 transition-colors">انستقرام</a>
                <a href="#" className="hover:text-stone-800 transition-colors">الشروط والأحكام</a>
            </div>
        </footer>
    </section>

    </div>
  );
}
