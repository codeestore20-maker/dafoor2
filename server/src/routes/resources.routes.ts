import express from 'express';
import { ResourcesController } from '../controllers/ResourcesController';
import { AIController } from '../controllers/AIController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

// Resource CRUD
router.get('/', ResourcesController.getAll);
router.get('/:id', ResourcesController.getOne);
router.post('/upload', ResourcesController.upload);

// AI Features

// Summary
router.post('/:id/generate/summary', AIController.generateSummary);
router.get('/:id/summary', AIController.getSummary);

// Flashcards
router.post('/:id/generate/flashcards', AIController.generateFlashcards);
router.get('/:id/flashcards', AIController.getFlashcards);

// Quiz
router.post('/:id/generate/quiz', AIController.generateQuiz);
router.get('/:id/quiz', AIController.getQuiz);

// Notes
router.post('/:id/generate/notes', AIController.generateNotes);
router.get('/:id/notes', AIController.getNotes);

// Glossary
router.post('/:id/generate/glossary', AIController.generateGlossary);
router.get('/:id/glossary', AIController.getGlossary);

// Exam Prediction
router.post('/:id/generate/predictions', AIController.generatePredictions);
router.get('/:id/predictions', AIController.getPredictions);

// Repair Lesson
router.post('/:id/repair-lesson', AIController.generateRepairLesson);

// Weak Points & Mistakes
router.get('/:id/weak-points', AIController.getWeakPoints);
router.post('/:id/weak-points/:weakPointId/resolve', AIController.resolveWeakPoint);
router.post('/:id/mistakes', AIController.recordMistake);
router.get('/:id/mistakes', AIController.getWeakPoints); // Reused getWeakPoints as it returns same structure
router.post('/:id/mistakes/:mistakeId/resolve', AIController.resolveWeakPoint); // Reused resolveWeakPoint

// Complex Topics
router.post('/:id/generate/complex-topics', AIController.generateComplexTopics);

// Auto Complete
router.post('/:id/generate/autocomplete', AIController.generateAutoComplete);

// Chat
router.post('/:id/chat', AIController.chat);

export default router;
