import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Grid, List as ListIcon, Search, MoreVertical, Paperclip, Download, Trash2, ExternalLink } from 'lucide-react';
import { UploadModal } from '../shared/UploadModal';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { FileCard } from '../shared/FileCard';

interface SubjectSectionProps {
  subjectId: string;
  subjectName: string;
}

export function SubjectSection({ subjectId, subjectName }: SubjectSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleUpload = (fileData: any, language: string) => {
    if (!subjectId) return;
    
    uploadMutation.mutate({
      ...fileData,
      subjectId,
      language
    });
  };

  const onFileSelect = (fileId: string, fileName: string) => {
      navigate(`/app/study/${fileId}`);
  };

  const filteredFiles = files.filter((f: any) => 
    f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-white/50">
      
      {/* Background Pattern - Graph Paper */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0" 
           style={{ backgroundImage: 'radial-gradient(#A8A29E 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Red Margin Line */}
      <div className="absolute top-0 bottom-0 left-12 rtl:right-12 rtl:left-auto w-0.5 bg-red-400/30 z-0 pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col pl-8 rtl:pr-8 rtl:pl-0">
        
        {/* Header Section */}
        <div className="px-6 py-6 border-b border-dashed border-stone-300 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <h1 className="font-hand text-4xl font-bold text-stone-800 relative z-10 inline-block">
               {subjectName}
               {/* Underline Doodle */}
               <svg className="absolute -bottom-2 left-0 w-full h-3 text-school-board/40 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
               </svg>
             </h1>
             <p className="text-stone-500 font-serif italic mt-2 text-sm">
               {t('files_count', { count: files.length })}
             </p>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-4">
             {/* Search */}
             <div className="relative group">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_in_subject', { subject: subjectName })} 
                  className="w-full md:w-64 pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 bg-white rounded-lg border-2 border-stone-200 focus:border-stone-400 focus:outline-none font-hand transition-all shadow-sm"
                />
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600" size={18} />
             </div>

             {/* Actions */}
             <div className="flex items-center gap-2">
                 <div className="bg-white p-1 rounded-lg border-2 border-stone-200 flex shadow-sm">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>
                      <Grid size={18} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}>
                      <ListIcon size={18} />
                    </button>
                 </div>

                 <button 
                   onClick={() => setIsUploadOpen(true)} 
                   className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 text-white rounded-lg font-hand font-bold shadow-md hover:bg-stone-900 hover:-translate-y-0.5 transition-all active:translate-y-0"
                 >
                   <Upload size={18} className="flip-rtl" />
                   <span>{t('upload_file')}</span>
                 </button>
             </div>
          </div>
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
           {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
             </div>
           ) : filteredFiles.length > 0 ? (
             <div className={`
               ${viewMode === 'grid' 
                 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                 : 'flex flex-col gap-2'
               }
             `}>
               {filteredFiles.map((file: any, index: number) => (
                 <FileCard 
                   key={file.id} 
                   file={file} 
                   index={index} 
                   viewMode={viewMode}
                   onClick={onFileSelect}
                 />
               ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} className="text-stone-300" />
                </div>
                <h3 className="font-hand text-xl text-stone-500 mb-2">{t('no_files_found')}</h3>
                <p className="text-stone-400 text-sm max-w-xs">{t('upload_first_file')}</p>
             </div>
           )}
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
