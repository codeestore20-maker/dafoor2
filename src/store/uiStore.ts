import { create } from 'zustand';

export type ViewMode = 'summary' | 'flashcards' | 'quiz' | 'map' | 'course_map' | 'weakpoints' | 'predictions' | 'glossary' | 'predictor' | 'notebooks' | 'review' | 'notes';

interface UIState {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  
  isMobileChatOpen: boolean;
  setIsMobileChatOpen: (isOpen: boolean) => void;
  
  // To handle loading states globally without losing them on page transition
  globalLoading: boolean;
  setGlobalLoading: (isLoading: boolean) => void;

  activeSubjectId: string | null;
  setActiveSubjectId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'summary',
  setCurrentView: (view) => set({ currentView: view }),
  
  focusMode: false,
  setFocusMode: (focus) => set({ focusMode: focus }),
  
  isChatOpen: true,
  setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  isMobileChatOpen: false,
  setIsMobileChatOpen: (isOpen) => set({ isMobileChatOpen: isOpen }),
  
  globalLoading: false,
  setGlobalLoading: (isLoading) => set({ globalLoading: isLoading }),

  activeSubjectId: null,
  setActiveSubjectId: (id) => set({ activeSubjectId: id }),
}));
