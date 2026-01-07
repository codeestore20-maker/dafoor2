import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Grid, List as ListIcon, Search, MoreVertical, Paperclip, Download, Trash2, ExternalLink } from 'lucide-react';
import { UploadModal } from './UploadModal';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../lib/api';
import { useTranslation } from 'react-i18next';

import { FileCard } from './FileCard';

interface RepositoryViewProps {
  subjectId: string;
  subjectName: string;
}

export function RepositoryView({ subjectId, subjectName }: RepositoryViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Fetch resources
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['resources', subjectId],
    queryFn: () => resourceService.getAll(subjectId),
    enabled: !!subjectId
  });

  const uploadMutation = useMutation({
    mutationFn: resourceService.upload,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['resources', subjectId] });
        setIsUploadOpen(false);
    }
  });

  const handleUpload = (file: File, language: string) => {
    if (!subjectId) return;
    
    const formData = new FormData();
    formData.append('subjectId', subjectId);
    formData.append('language', language);
    formData.append('file', file);
    
    uploadMutation.mutate(formData);
  };

  const onFileSelect = (fileId: string, fileName: string) => {
      navigate(`/app/study/${fileId}`);
  };

  return <div className="h-full flex flex-col relative overflow-hidden bg-stone-50">
      {/* Background Pattern - Graph Paper */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0" 
           style={{ backgroundImage: 'radial-gradient(#A8A29E 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Header - Minimalist with Tape */}
      <div className="z-10 px-6 py-5 flex items-end justify-between gap-6 relative">
        <div className="relative">
           {/* Tape Effect */}
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/40 backdrop-blur-sm rotate-1 shadow-sm border border-white/50 z-0"></div>
           
           <h1 className="font-hand text-3xl font-bold text-stone-800 relative z-10 px-4 py-1 bg-white/80 transform -rotate-1 shadow-sm border border-stone-200 rounded-sm">
             {subjectName}
           </h1>
           <p className="text-stone-500 font-serif italic mt-1 ml-2 text-xs">
             {t('files_count', { count: files.length })} • {t('repository')}
           </p>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-56">
               <input 
                 type="text" 
                 placeholder={t('search_in_subject', { subject: subjectName })} 
                 className="w-full pl-3 pr-8 py-1.5 bg-white/50 border-b-2 border-stone-300 focus:border-stone-500 focus:outline-none font-hand text-stone-700 placeholder-stone-400 transition-colors text-sm" 
               />
               <Search className="absolute right-0 top-1/2 -translate-x-1/2 text-stone-400" size={16} />
            </div>

            <div className="bg-white p-1 rounded-lg border border-stone-200 shadow-sm flex">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>
                <Grid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>
                <ListIcon size={16} />
              </button>
            </div>

            <button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg font-hand font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm active:translate-y-0 active:shadow-md">
              <Upload size={16} className="flip-rtl" />
              <span className="hidden sm:inline">{t('upload_file')}</span>
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-hand text-lg text-stone-500">{t('loading_files')}</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mb-6 shadow-lg rotate-3 border border-stone-200">
                <FileText size={48} className="text-stone-300" />
              </div>
              <h3 className="font-hand text-2xl font-bold text-stone-700 mb-2">{t('quiet_here')}</h3>
              <p className="font-serif text-stone-500 max-w-xs mb-6 text-base italic">
                {t('upload_first_doc_desc')}
              </p>
              <button onClick={() => setIsUploadOpen(true)} className="px-6 py-2 bg-stone-800 text-white rounded-xl font-hand font-bold shadow-lg hover:scale-105 transition-all">
                {t('upload_file')}
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
               {files.map((file: any, index: number) => (
                 <FileCard 
                    key={file.id} 
                    file={file} 
                    index={index} 
                    viewMode={viewMode}
                    onClick={onFileSelect}
                 />
               ))}
            </div>
          )}
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        isUploading={uploadMutation.isPending}
        subjectId={subjectId}
      />
  </div>;
}
