import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { CreateSubjectModal } from '../dashboard/CreateSubjectModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectService } from '../../lib/api';
import { Sidebar } from '../layout/Sidebar';
import { RepositoryView } from './RepositoryView';
import { Dashboard } from '../dashboard/Dashboard';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';

interface LibraryContext {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Library() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSidebarOpen, setIsSidebarOpen } = useOutletContext<LibraryContext>();

  // Get subjectId from URL query param for SPA feel with deep linking
  const selectedSubjectId = searchParams.get('subjectId');

  // Fetch subjects from API
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll
  });

  const createSubjectMutation = useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsCreateModalOpen(false);
    }
  });

  const handleSelectSubject = (id: string) => {
    setSearchParams({ subjectId: id });
  };
  
  const handleGoHome = () => {
    setSearchParams({});
  };

  const handleCreateSubject = (newSubject: any) => {
    createSubjectMutation.mutate(newSubject);
  };

  const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);

  return (
    <div className="h-full w-full bg-stone-100 flex overflow-hidden relative font-sans text-stone-800 md:p-4 md:gap-4">
      
      {/* Sidebar - Floating Island Style */}
      <Sidebar 
        subjects={subjects} 
        selectedSubjectId={selectedSubjectId} 
        onSelectSubject={handleSelectSubject}
        onAddSubject={() => setIsCreateModalOpen(true)}
        onGoHome={handleGoHome}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area - Rounded Card */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-stone-50 md:rounded-3xl shadow-xl border border-stone-200">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-paper-pattern opacity-30 pointer-events-none z-0"></div>

        <div className="relative z-10 h-full">
          {selectedSubject ? (
            <RepositoryView 
              subjectId={selectedSubject.id} 
              subjectName={selectedSubject.name} 
            />
          ) : (
            <Dashboard />
          )}
        </div>
      </div>

      <CreateSubjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSubject}
      />
    </div>
  );
}
