export interface RecentFile {
  id: string;
  name: string;
  subject: string;
  type: string;
  size: string;
  timestamp: number;
}

const RECENT_FILES_KEY = 'studdy_recent_files';

export const recentFilesService = {
  addFile: (file: Omit<RecentFile, 'timestamp'>) => {
    try {
      const existing = localStorage.getItem(RECENT_FILES_KEY);
      let files: RecentFile[] = existing ? JSON.parse(existing) : [];
      
      // Remove if exists to re-add at top
      files = files.filter(f => f.id !== file.id);
      
      // Add new file with timestamp
      files.unshift({ ...file, timestamp: Date.now() });
      
      // Keep only last 3
      if (files.length > 3) {
        files = files.slice(0, 3);
      }
      
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save recent file', e);
    }
  },

  getFiles: (): RecentFile[] => {
    try {
      const existing = localStorage.getItem(RECENT_FILES_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      console.error('Failed to get recent files', e);
      return [];
    }
  }
};
