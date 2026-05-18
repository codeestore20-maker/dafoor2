import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Book, Calculator, FlaskConical, Globe, Languages, Music, Palette, Laptop, Layout, 
  Plus, Home, LogOut, ChevronRight, FileText, Loader2, Menu, X, BarChart3, BrainCircuit, Activity, Upload,
  Target, Flame, Sun, Coffee, Moon, GraduationCap
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subjectService, resourceService } from '../../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateSubjectModal } from '../dashboard/CreateSubjectModal';
import { UploadModal } from '../shared/UploadModal';
import { useAuth } from '../../context/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { OnboardingProvider } from '../../context/OnboardingContext';
import { ChalkCharacter, ChalkStar } from '../shared/Doodles';

const ICON_MAP: Record<string, any> = {
  math: Calculator, science: FlaskConical, history: Globe, literature: Book,
  languages: Languages, arts: Palette, music: Music, tech: Laptop, other: Layout, default: Book
};


// ─── MAIN LAYOUT ───
export function WorkspaceLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const isRtl = i18n.language === 'ar';
  const { activeSubjectId, setActiveSubjectId } = useUIStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (subjectId) setActiveSubjectId(subjectId);
    else setActiveSubjectId(null);
  }, [subjectId, setActiveSubjectId]);

  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll
  });

  const handleSubjectClick = (id: string) => { navigate(`/app/subject/${id}`); setIsMobileMenuOpen(false); };
  const handleHomeClick = () => { navigate('/app'); setIsMobileMenuOpen(false); };
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <OnboardingProvider>
      <div className="h-full w-full flex overflow-hidden font-sans text-stone-800 selection:bg-school-board/20 selection:text-school-board">
        
        {/* === SIDEBAR: Locker / Pencil Case Style === */}
        <aside className="hidden md:flex w-[240px] shrink-0 flex-col bg-school-board relative z-20">
          <SidebarContent subjects={subjects} activeSubjectId={activeSubjectId} onSubjectClick={handleSubjectClick} onHomeClick={handleHomeClick} onAddSubject={() => setIsCreateModalOpen(true)} user={user} onLogout={handleLogout} isSubjectsLoading={isSubjectsLoading} t={t} />
        </aside>

        {/* === MOBILE HEADER === */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-school-board z-30 flex items-center justify-between px-3 shadow-lg">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/80 hover:text-white rounded-lg active:scale-95">
              <Menu size={22} />
            </button>
            <span className="font-hand font-extrabold text-white text-lg">🦉 دافور</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-white/60 hover:text-white"><LogOut size={18} /></button>
        </div>

        {/* === MOBILE DRAWER === */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
              <motion.div
                initial={{ x: isRtl ? '100%' : '-100%' }} animate={{ x: 0 }} exit={{ x: isRtl ? '100%' : '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className={`fixed top-0 bottom-0 w-[80%] max-w-[300px] bg-school-board z-50 md:hidden flex flex-col shadow-2xl ${isRtl ? 'right-0' : 'left-0'}`}
              >
                <SidebarContent subjects={subjects} activeSubjectId={activeSubjectId} onSubjectClick={handleSubjectClick} onHomeClick={handleHomeClick} onAddSubject={() => setIsCreateModalOpen(true)} user={user} onLogout={handleLogout} isSubjectsLoading={isSubjectsLoading} t={t} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* === MAIN AREA: The Desk === */}
        <main className="flex-1 overflow-y-auto relative pt-14 md:pt-0 scroll-smooth bg-stone-100/80">
          <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 min-h-full">
            {!activeSubjectId ? (
              <WorkspaceOverview onUploadClick={() => setIsUploadModalOpen(true)} onCreateClick={() => setIsCreateModalOpen(true)} subjects={subjects} />
            ) : (
              <WorkspaceSubjectView subjectId={activeSubjectId} onUploadClick={() => setIsUploadModalOpen(true)} />
            )}
          </div>
        </main>

        {/* === MODALS === */}
        <CreateSubjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={async (data) => {
          await subjectService.create(data);
          queryClient.invalidateQueries({ queryKey: ['subjects'] });
          setIsCreateModalOpen(false);
        }} />
        {isUploadModalOpen && <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} subjectId={activeSubjectId as string} onUpload={async (data, lang) => {
          const res = await resourceService.upload({ ...data, subjectId: activeSubjectId, language: lang });
          queryClient.invalidateQueries({ queryKey: ['resources'] });
          setIsUploadModalOpen(false);
          return res;
        }} isUploading={false} />}
      </div>
    </OnboardingProvider>
  );
}

// ─── SIDEBAR: Chalkboard Wall ───
function SidebarContent({ subjects, activeSubjectId, onSubjectClick, onHomeClick, onAddSubject, user, onLogout, isSubjectsLoading, t }: any) {
  return (
    <div className="h-full flex flex-col bg-chalk-pattern text-white relative">
      {/* Chalk dust overlay */}
      <div className="absolute inset-0 bg-white/[0.03] pointer-events-none"></div>

      {/* Brand */}
      <div className="relative z-10 p-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-school-pencil rounded-lg flex items-center justify-center shadow-md border-2 border-yellow-400/60 transform -rotate-3">
            <GraduationCap size={22} className="text-school-graphite" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-hand text-xl font-extrabold text-school-chalk leading-none">دافور</h2>
            <span className="text-[10px] font-hand text-school-chalk/50">Dafoor Study</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <div className="w-7 h-7 bg-school-pencil/80 rounded-full flex items-center justify-center text-school-graphite font-hand font-bold text-sm border border-yellow-400/40">
            {user?.name?.charAt(0).toUpperCase() || 'د'}
          </div>
          <span className="font-hand text-xs text-school-chalk/70 truncate">{user?.name || 'طالب'}</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 relative z-10 custom-scrollbar">
        {/* Home */}
        <button onClick={onHomeClick}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-hand text-sm ${!activeSubjectId ? 'bg-white/15 text-school-pencil font-bold' : 'text-school-chalk/70 hover:bg-white/10 hover:text-white'}`}>
          <Home size={16} />
          <span>الرئيسية</span>
        </button>

        <div className="flex items-center gap-2 px-3 pt-4 pb-2">
          <div className="h-px flex-1 bg-white/10"></div>
          <span className="text-[9px] font-hand font-bold text-school-chalk/30 uppercase tracking-widest">المواد</span>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>

        {/* Subjects as chalk list */}
        {isSubjectsLoading ? (
          <div className="px-3 py-4 flex justify-center"><Loader2 size={18} className="animate-spin text-school-chalk/30" /></div>
        ) : subjects.map((subject: any) => {
          const Icon = ICON_MAP[subject.icon] || ICON_MAP.default;
          const isActive = activeSubjectId === subject.id;
          return (
            <button key={subject.id} onClick={() => onSubjectClick(subject.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-hand text-sm relative ${isActive ? 'bg-white/15 text-school-pencil font-bold' : 'text-school-chalk/60 hover:bg-white/10 hover:text-white'}`}>
              {isActive && <div className="absolute right-0 rtl:left-0 rtl:right-auto top-1/2 -translate-y-1/2 w-1 h-5 bg-school-pencil rounded-full"></div>}
              <Icon size={15} className={isActive ? 'text-school-pencil' : ''} />
              <span className="truncate">{subject.name}</span>
            </button>
          );
        })}

        {/* Add subject */}
        <button onClick={onAddSubject}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-school-chalk/40 hover:text-school-pencil hover:bg-white/10 transition-all font-hand text-sm border border-dashed border-white/10 hover:border-school-pencil/40 mt-2">
          <Plus size={14} />
          <span>مادة جديدة</span>
        </button>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-3 border-t border-white/10 space-y-1">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-school-chalk/40 hover:text-red-300 hover:bg-white/5 transition-all font-hand text-sm">
          <LogOut size={15} />
          <span>خروج</span>
        </button>
      </div>
    </div>
  );
}

// ─── ANIMATION VARIANTS ───
const pop = { hidden: { opacity: 0, scale: 0.9, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

// ─── HOME PAGE ───
function WorkspaceOverview({ onUploadClick, onCreateClick, subjects }: { onUploadClick: () => void, onCreateClick: () => void, subjects: any[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: recentFiles = [], isLoading } = useQuery({
    queryKey: ['resources', 'all'],
    queryFn: async () => {
      const allSubjects = await subjectService.getAll();
      let allFiles: any[] = [];
      for (const s of allSubjects) {
        const files = await resourceService.getAll(s.id);
        allFiles = [...allFiles, ...files.map((f: any) => ({ ...f, subjectName: s.name, subjectIcon: s.icon }))];
      }
      return allFiles.sort((a, b) => {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        if (isNaN(da)) return 1; if (isNaN(db)) return -1;
        return db - da;
      });
    }, enabled: true
  });

  const totalFilesCount = recentFiles.length;

  // Time greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'صباح الخير ☀️' : hour < 17 ? 'مساء النور 🌤️' : 'مساء الخير 🌙';

  // Study streak
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasActivity = recentFiles.some((f: any) => {
      try { const fd = new Date(f.createdAt); return !isNaN(fd.getTime()) && fd.toISOString().split('T')[0] === dateStr; } catch { return false; }
    });
    if (hasActivity) streak++; else if (i > 0) break;
  }

  // Activity for last 7 days
  const last7Days = Array.from({length: 7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const activityData = last7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    return recentFiles.filter((f: any) => {
      try { const fd = new Date(f.createdAt); return !isNaN(fd.getTime()) && fd.toISOString().split('T')[0] === dateStr; } catch { return false; }
    }).length;
  });
  const maxActivity = Math.max(...activityData, 1);
  const todayActivity = activityData[6];

  // Quotes
  const quotes = [
    { text: 'النجاح ليس نهاية الطريق، والفشل ليس قاتلاً!', author: 'تشرشل' },
    { text: 'العلم نور والجهل ظلام.', author: 'مثل عربي' },
    { text: 'كل خبير كان يوماً مبتدئاً.', author: 'هيلين كيلر' },
    { text: 'المذاكرة مثل الرياضة، كلما تدربت أكثر أصبحت أقوى.', author: 'دافور 🦉' },
    { text: 'لا تنتظر الفرصة، اصنعها!', author: 'برنارد شو' },
  ];
  const [qi, setQi] = useState(0);
  useEffect(() => { const iv = setInterval(() => setQi(p => (p + 1) % quotes.length), 8000); return () => clearInterval(iv); }, []);

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">

      {/* ═══════════════════════════════════════════
          ROW 1: THE CHALKBOARD
          ═══════════════════════════════════════════ */}
      <motion.div variants={pop} className="bg-school-board bg-chalk-pattern rounded-2xl p-5 md:p-6 text-white shadow-2xl relative overflow-hidden border-4 border-[#1a3a2a]">
        {/* Chalk texture */}
        <div className="absolute inset-0 bg-white/[0.04] pointer-events-none rounded-2xl"></div>
        {/* Chalk tray at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#1a3a2a] border-t-2 border-[#0f2218]">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-school-pencil/60 rounded-sm"></div>
        </div>

        {/* Floating doodles */}
        <ChalkStar className="absolute top-4 right-6 w-3 h-3 text-school-pencil/25" delay={0} />
        <ChalkStar className="absolute top-8 right-24 w-2.5 h-2.5 text-white/10" delay={1} />
        
        {/* Owl mascot - on the END side (opposite of text direction) */}
        <div className="absolute bottom-5 right-6 md:right-12 w-24 h-28 text-white/[0.10] hover:text-white/18 transition-colors duration-500 hidden md:block rtl:left-12 rtl:right-auto">
          <ChalkCharacter emotion="happy" />
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="inline-block px-2.5 py-0.5 border-2 border-dashed border-school-pencil/40 rounded-md bg-white/5 mb-3">
            <span className="font-hand text-xs font-bold text-school-pencil">{timeGreeting}</span>
          </motion.div>
          
          <h1 className="text-2xl md:text-3xl font-hand font-extrabold leading-tight mb-2">
            اهلاً، انا <span className="text-school-pencil">دافور</span>!
          </h1>
          <p className="text-white/80 text-sm font-hand leading-relaxed mb-4 max-w-sm">
            عندك درس مو فاهمه؟ او تبغى نفرم المنهج مع بعض؟ ارفع ملفك وانا اجهزه لك!
          </p>

          <div className="flex flex-wrap gap-2">
            <button onClick={onUploadClick}
              className="bg-school-pencil text-school-graphite px-4 py-2 rounded-xl font-hand font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 text-sm border-2 border-yellow-500/50">
              <Upload size={16} /> ارفع ملف
            </button>
            <button onClick={onCreateClick}
              className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl font-hand font-bold backdrop-blur-sm transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm border-2 border-dashed border-white/30">
              <Plus size={16} /> مادة جديدة
            </button>
          </div>
        </div>

        {/* Stats written in chalk ON the board */}
        <div className="relative z-10 mt-6 md:mt-0 md:absolute md:bottom-6 md:right-8 rtl:md:left-8 rtl:md:right-auto flex gap-4 md:gap-5">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-hand font-extrabold text-school-pencil">{subjects.length}</p>
            <p className="text-[9px] font-hand font-bold text-school-chalk/50">مادة</p>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-hand font-extrabold text-school-pencil">{totalFilesCount}</p>
            <p className="text-[9px] font-hand font-bold text-school-chalk/50">ملف</p>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-hand font-extrabold text-school-pencil">{streak}🔥</p>
            <p className="text-[9px] font-hand font-bold text-school-chalk/50">يوم متتالي</p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          ROW 2: SUBJECTS - Corkboard with Pinned Cards
          ═══════════════════════════════════════════ */}
      {subjects.length > 0 && (
        <motion.div variants={pop}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-hand text-base font-bold text-school-graphite flex items-center gap-2">
              📌 موادي
            </h3>
            <button onClick={onCreateClick}
              className="text-xs font-hand font-bold text-school-board hover:text-school-board/80 flex items-center gap-1 bg-school-board/5 px-2.5 py-1 rounded-lg hover:bg-school-board/10 transition-colors">
              <Plus size={12} /> أضف مادة
            </button>
          </div>
          
          {/* Corkboard background */}
          <div className="bg-[#d4b896] rounded-2xl p-4 md:p-5 border-2 border-[#b89a72] shadow-md relative overflow-hidden"
            style={{ backgroundImage: `radial-gradient(circle, #c4a878 1px, transparent 1px)`, backgroundSize: '12px 12px' }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {subjects.map((subject: any, idx: number) => {
                const Icon = ICON_MAP[subject.icon] || ICON_MAP.default;
                const rotations = ['rotate-1', '-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1.5'];
                const pinColors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-pink-400', 'bg-purple-400'];
                return (
                  <motion.button
                    key={subject.id}
                    variants={pop}
                    onClick={() => navigate(`/app/subject/${subject.id}`)}
                    className={`group bg-white rounded-xl p-3.5 border border-stone-200 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative ${rotations[idx % rotations.length]} hover:rotate-0`}
                  >
                    {/* Pushpin */}
                    <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 ${pinColors[idx % pinColors.length]} rounded-full shadow-sm border border-white/50 z-10`}></div>
                    
                    <div className="flex flex-col items-center text-center gap-2 pt-1">
                      <div className="w-10 h-10 bg-school-board/10 rounded-xl flex items-center justify-center group-hover:bg-school-board/20 transition-colors group-hover:scale-110 transition-transform">
                        <Icon size={22} className="text-school-board" strokeWidth={2} />
                      </div>
                      <span className="font-hand font-bold text-sm text-school-graphite group-hover:text-school-board transition-colors line-clamp-2 leading-snug">{subject.name}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════
          ROW 3: DESK AREA (Files + Side Notes)
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Recent Files - Stack of Papers */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={pop} className="relative">
            {/* Stack effect - papers behind */}
            <div className="absolute -top-1 left-1 right-2 h-full bg-white/60 rounded-2xl border border-stone-200/50 transform rotate-1"></div>
            <div className="absolute -top-0.5 left-0.5 right-1 h-full bg-white/80 rounded-2xl border border-stone-200/50 transform -rotate-0.5"></div>
            
            {/* Main paper */}
            <div className="relative bg-white rounded-2xl border-2 border-stone-200 shadow-lg overflow-hidden">
              {/* Red margin line */}
              <div className="absolute left-12 top-0 bottom-0 w-px bg-red-200/60 z-10 pointer-events-none"></div>
              {/* Three-hole punch */}
              <div className="absolute left-5 top-0 bottom-0 flex flex-col items-center justify-around py-8 z-10 pointer-events-none">
                <div className="w-4 h-4 rounded-full border-2 border-stone-200 bg-[#f5f0e8]"></div>
                <div className="w-4 h-4 rounded-full border-2 border-stone-200 bg-[#f5f0e8]"></div>
                <div className="w-4 h-4 rounded-full border-2 border-stone-200 bg-[#f5f0e8]"></div>
              </div>

              {/* Header */}
              <div className="pl-16 pr-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-hand font-bold text-school-graphite flex items-center gap-2 text-base">
                  📋 آخر الملفات
                </h3>
                {todayActivity > 0 && (
                  <span className="font-hand text-xs font-bold bg-school-board/10 text-school-board px-2 py-1 rounded-lg">{todayActivity} اليوم</span>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10">
                {isLoading ? (
                  <div className="pl-16 pr-5 py-4 space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : recentFiles.length > 0 ? (
                  <div className="divide-y divide-stone-100">
                    {recentFiles.slice(0, 7).map((file: any) => (
                      <FilePaperRow key={file.id} file={file} onClick={() => navigate(`/app/study/${file.id}`)} />
                    ))}
                    {recentFiles.length > 7 && (
                      <button className="w-full pl-16 pr-5 py-3 text-center font-hand font-bold text-school-board hover:bg-school-board/5 transition-colors text-sm">
                        عرض الكل ({recentFiles.length}) ←
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pl-16 pr-5 py-10 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-hand font-bold text-school-graphite mb-1">لا توجد ملفات بعد!</p>
                    <p className="font-hand text-sm text-stone-400 mb-4">ارفع محاضراتك وانا اجهزها لك</p>
                    <button onClick={onUploadClick}
                      className="bg-school-pencil text-school-graphite px-4 py-2 rounded-xl font-hand font-bold hover:-translate-y-0.5 transition-transform text-sm inline-flex items-center gap-2 shadow-sm border border-yellow-400">
                      <Upload size={16} /> ارفع اول ملف
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Empty state CTA when no files */}
          {recentFiles.length === 0 && !isLoading && (
            <motion.div variants={pop} className="bg-school-board/5 rounded-2xl p-6 border-2 border-dashed border-school-board/20 text-center">
              <div className="text-5xl mb-3">🎓</div>
              <h3 className="font-hand text-xl font-bold text-school-graphite mb-2">جاهز تبدأ؟</h3>
              <p className="font-hand text-sm text-school-graphite/60 mb-4 max-w-md mx-auto">ارفع ملف PDF او صورة محاضرة والذكاء الاصطناعي يجهزلك ملخص وخرائط ذهنية وفلاش كاردز!</p>
              <div className="flex justify-center gap-3">
                <button onClick={onUploadClick} className="bg-school-board text-white px-5 py-2.5 rounded-xl font-hand font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Upload size={16} /> ارفع ملف
                </button>
                <button onClick={onCreateClick} className="bg-white text-school-board px-5 py-2.5 rounded-xl font-hand font-bold border-2 border-school-board/20 hover:border-school-board/40 transition-all flex items-center gap-2">
                  <Plus size={16} /> انشئ مادة
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Sticky Notes Column */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Activity Chart - Mini chalkboard */}
          <motion.div variants={pop} className="bg-school-board rounded-2xl p-4 text-white shadow-lg relative overflow-hidden border-2 border-[#1a3a2a]">
            <div className="absolute inset-0 bg-white/[0.03] pointer-events-none"></div>
            <h3 className="font-hand text-sm font-bold text-school-chalk mb-3 flex items-center gap-2 relative z-10">
              📊 نشاط الاسبوع
            </h3>
            <div className="relative z-10">
              <div className="flex items-end gap-1.5 h-16">
                {activityData.map((count, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center group cursor-pointer">
                    <div className={`w-full rounded-t-sm transition-all ${count > 0 ? 'bg-school-pencil/70 hover:bg-school-pencil' : 'bg-white/10'}`}
                      style={{ height: `${(count / maxActivity) * 100 || 8}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-school-graphite font-hand text-[9px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] font-hand font-bold text-school-chalk/30 mt-1">
                <span>قبل</span><span>اليوم</span>
              </div>
            </div>
          </motion.div>

          {/* Quote - Sticky note */}
          <motion.div variants={pop} className="bg-[#fff9ab] p-4 rounded-sm shadow-md relative transform rotate-1 hover:rotate-0 transition-transform border border-yellow-300/50">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-orange-300/50 -rotate-1 rounded-sm"></div>
            <h3 className="font-hand text-xs font-bold text-orange-800/60 mb-1.5 flex items-center gap-1">💡 حكمة اليوم</h3>
            <AnimatePresence mode="wait">
              <motion.div key={qi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <p className="font-hand text-sm text-orange-900/80 leading-relaxed">"{quotes[qi].text}"</p>
                <p className="font-hand text-[10px] font-bold text-orange-800/40 mt-1">— {quotes[qi].author}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Tip - Green sticky */}
          <motion.div variants={pop} className="bg-[#c8e6c9] p-4 rounded-sm shadow-md relative transform -rotate-1 hover:rotate-0 transition-transform border border-green-300/50">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-green-300/50 rotate-1 rounded-sm"></div>
            <h3 className="font-hand text-xs font-bold text-green-800/60 mb-1.5 flex items-center gap-1">🦉 نصيحة دافور</h3>
            <p className="font-hand text-sm text-green-900/80 leading-relaxed">
              جرب <span className="font-bold bg-green-200/60 px-1 rounded">الفلاش كاردز</span> بعد كل محاضرة! المراجعة المتقطعة أقوى بـ 10 مرات من المذاكرة مرة واحدة.
            </p>
          </motion.div>

          {/* Daily Goal - Blue sticky */}
          <motion.div variants={pop} className="bg-[#bbdefb] p-4 rounded-sm shadow-md relative transform rotate-1 hover:rotate-0 transition-transform border border-blue-300/50">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-blue-300/50 -rotate-2 rounded-sm"></div>
            <h3 className="font-hand text-xs font-bold text-blue-800/60 mb-2 flex items-center gap-1">🎯 هدف اليوم</h3>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#90caf9" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#1565c0" strokeWidth="3.5"
                    strokeDasharray={`${Math.min((todayActivity / 3) * 87.96, 87.96)} 87.96`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-hand text-xs font-extrabold text-blue-900">{todayActivity}/3</span>
                </div>
              </div>
              <div>
                <p className="font-hand text-sm font-bold text-blue-900">ارفع 3 ملفات</p>
                <p className="font-hand text-[11px] text-blue-700/50">
                  {todayActivity >= 3 ? '🎉 أحسنت! أنجزت هدفك!' : `باقي ${Math.max(0, 3 - todayActivity)} ملفات`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Streak Badge */}
          {streak > 0 && (
            <motion.div variants={pop} className="bg-[#ffe0b2] p-4 rounded-sm shadow-md relative transform -rotate-1 hover:rotate-0 transition-transform border border-orange-300/50">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-orange-300/50 rotate-1 rounded-sm"></div>
              <div className="text-center">
                <span className="text-3xl">🏆</span>
                <p className="font-hand text-lg font-extrabold text-orange-900">{streak} يوم متتالي!</p>
                <p className="font-hand text-[11px] text-orange-800/50">استمر وما توقف!</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── SUBJECT VIEW ───
function WorkspaceSubjectView({ subjectId, onUploadClick }: { subjectId: string, onUploadClick: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { data: subject, isLoading: isSubLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => { const all = await subjectService.getAll(); return all.find((s: any) => s.id === subjectId); }
  });

  const { data: resources = [], isLoading: isResLoading } = useQuery({
    queryKey: ['resources', subjectId],
    queryFn: () => resourceService.getAll(subjectId)
  });

  if (isSubLoading) return <div className="p-12 flex justify-center"><Loader2 size={32} className="animate-spin text-school-board/50" /></div>;
  if (!subject) return <div>{t('subject_not_found', 'المادة غير موجودة')}</div>;

  const Icon = ICON_MAP[subject.icon] || ICON_MAP.default;

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      {/* Subject Header - Book cover style */}
      <motion.div variants={pop} className="bg-school-board rounded-2xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden border-2 border-[#1a3a2a]">
        <div className="absolute inset-0 bg-white/[0.03] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-school-pencil rounded-xl flex items-center justify-center shadow-md border-2 border-yellow-400/50 transform -rotate-3">
              <Icon size={28} className="text-school-graphite" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-hand font-extrabold tracking-tight">{subject.name}</h1>
              <p className="text-school-chalk/60 text-sm font-hand mt-1 flex items-center gap-1.5">
                <FileText size={14} /> {resources.length} ملف
              </p>
            </div>
          </div>
          <button onClick={onUploadClick}
            className="bg-school-pencil text-school-graphite px-5 py-2.5 rounded-xl font-hand font-bold shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 text-sm border-2 border-yellow-400">
            <Plus size={16} /> رفع ملف
          </button>
        </div>
      </motion.div>

      {/* Files Grid - Papers on desk */}
      <motion.div variants={pop} className="bg-white/60 rounded-2xl p-5 md:p-6 min-h-[400px] border-2 border-stone-200/50 shadow-sm relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-hand font-bold text-school-graphite flex items-center gap-2 text-base">
            📁 الملفات والمحاضرات
          </h3>
        </div>

        {isResLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse border border-stone-200/50" />)}
          </div>
        ) : resources.length > 0 ? (
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.map((file: any) => (
              <FileCard key={file.id} file={file} onClick={() => navigate(`/app/study/${file.id}`)} />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={pop} className="text-center py-16 max-w-md mx-auto">
            <div className="text-5xl mb-4">📂</div>
            <h4 className="font-hand font-bold text-school-graphite text-lg mb-2">المادة فاضية!</h4>
            <p className="font-hand text-school-graphite/60 text-sm mb-6">ارفع محاضراتك والذكاء الاصطناعي يجهزها لك</p>
            <button onClick={onUploadClick}
              className="bg-school-board text-white px-6 py-2.5 rounded-xl font-hand font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
              <Plus size={16} /> ارفع اول ملف
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── FILE ROW (Paper on notebook) ───
function FilePaperRow({ file, onClick }: { file: any, onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <div onClick={onClick} className="pl-16 pr-5 py-3 flex items-center gap-3 hover:bg-school-board/5 transition-colors cursor-pointer group">
      <div className="w-9 h-9 bg-red-50 text-school-red rounded-lg flex items-center justify-center shrink-0 border border-red-200/50 group-hover:scale-110 transition-transform">
        <FileText size={18} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-hand font-bold text-school-graphite text-sm truncate group-hover:text-school-board transition-colors">{file.name}</h4>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-hand font-bold text-stone-400">
          <span className="truncate max-w-[100px]">{file.subjectName || 'عام'}</span>
          <span>•</span>
          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-stone-300 group-hover:text-school-board rtl:rotate-180 transition-colors shrink-0" />
    </div>
  );
}

// ─── FILE CARD (Colorful note card on desk) ───
const NOTE_COLORS = [
  'border-l-school-board',   // green
  'border-l-school-blue',    // blue  
  'border-l-school-red',     // red
  'border-l-school-pencil',  // yellow
  'border-l-purple-500',     // purple
  'border-l-amber-500',      // amber
  'border-l-rose-500',       // rose
  'border-l-teal-500',       // teal
];

function FileCard({ file, onClick }: { file: any, onClick: () => void }) {
  const { t } = useTranslation();
  const isReady = file.aiStatus === 'ready' || true;
  // Pick color based on file id hash for consistency
  const colorIndex = file.id ? file.id.charCodeAt(0) % NOTE_COLORS.length : 0;
  const borderColor = NOTE_COLORS[colorIndex];
  
  return (
    <motion.div variants={pop} onClick={onClick}
      className={`group bg-white rounded-lg border border-stone-200/80 border-l-4 ${borderColor} p-3.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full`}>
      
      {/* Top: Icon + Badge */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="w-8 h-8 bg-stone-50 text-stone-500 rounded-md flex items-center justify-center group-hover:bg-school-board/10 group-hover:text-school-board transition-colors">
          <FileText size={16} strokeWidth={2.5} />
        </div>
        <div className={`px-1.5 py-0.5 rounded text-[9px] font-hand font-bold flex items-center gap-1 ${isReady ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
          {isReady ? <><div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>جاهز</> : <><Loader2 size={8} className="animate-spin" />يحلل</>}
        </div>
      </div>

      {/* File name */}
      <h4 className="font-hand font-bold text-school-graphite text-sm line-clamp-2 group-hover:text-school-board transition-colors leading-snug mb-auto">{file.name}</h4>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-[10px] font-hand font-bold text-stone-400">
        <span className="truncate max-w-[55%]">{file.subjectName || 'عام'}</span>
        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}
