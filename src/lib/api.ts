import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const subjectService = {
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/subjects', data);
    return response.data;
  }
};

export const resourceService = {
  upload: async (formData: FormData) => {
    const response = await api.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async (subjectId?: string) => {
    const response = await api.get('/resources', { params: { subjectId } });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
  
  // AI Features
  getSummary: async (resourceId: string) => {
    const response = await api.get(`/resources/${resourceId}/summary`);
    return response.data;
  },
  generateSummary: async (resourceId: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/summary`);
    return response.data;
  },
  
  getFlashcards: async (resourceId: string) => {
    const response = await api.get(`/resources/${resourceId}/flashcards`);
    return response.data;
  },
  generateFlashcards: async (resourceId: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/flashcards`);
    return response.data;
  },

  getQuiz: async (resourceId: string) => {
    const response = await api.get(`/resources/${resourceId}/quiz`);
    return response.data;
  },
  generateQuiz: async (resourceId: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/quiz`);
    return response.data;
  },

  getNotes: async (resourceId: string) => {
    const response = await api.get(`/resources/${resourceId}/notes`);
    return response.data;
  },
  generateNotes: async (resourceId: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/notes`);
    return response.data;
  },

  getGlossary: async (resourceId: string) => {
    const response = await api.get(`/resources/${resourceId}/glossary`);
    return response.data;
  },
  generateGlossary: async (resourceId: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/glossary`);
    return response.data;
  },

  getPredictions: async (resourceId: string) => {
    const response = await api.get(`/resources/${resourceId}/predictions`);
    return response.data;
  },
  generatePredictions: async (resourceId: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/predictions`);
    return response.data;
  },

  generateRepairLesson: async (resourceId: string, concept: string) => {
    const response = await api.post(`/resources/${resourceId}/repair-lesson`, { concept });
    return response.data;
  },

  generateComplexTopics: async (resourceId: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/complex-topics`);
    return response.data;
  },

  generateAutoComplete: async (resourceId: string, text: string) => {
    const response = await api.post(`/resources/${resourceId}/generate/autocomplete`, { text });
    return response.data;
  },

  getWeakPoints: async (resourceId: string) => {
    const response = await api.get(`/resources/${resourceId}/weak-points`);
    return response.data;
  },
  recordMistake: async (resourceId: string, concept: string) => {
    const response = await api.post(`/resources/${resourceId}/mistakes`, { concept });
    return response.data;
  },
  resolveWeakPoint: async (resourceId: string, weakPointId: string) => {
    const response = await api.post(`/resources/${resourceId}/weak-points/${weakPointId}/resolve`);
    return response.data;
  },
  chat: async (resourceId: string, message: string, history: { role: 'user' | 'assistant', content: string }[]) => {
    const response = await api.post(`/resources/${resourceId}/chat`, { message, history });
    return response.data;
  }
};
