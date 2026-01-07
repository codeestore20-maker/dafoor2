import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ragService } from '../services/rag';

export const AIController = {
  // Summary
  generateSummary: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const summary = await ragService.summarize(id);
        res.json(summary);
    } catch (error) {
        console.error("Generate Summary Error:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
  },

  getSummary: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const summary = await prisma.summary.findUnique({ where: { resourceId: id } });
        if (!summary) return res.status(404).json({ error: "Summary not found" });
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch summary" });
    }
  },

  // Flashcards
  generateFlashcards: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deck = await ragService.generateFlashcards(id);
        res.json(deck);
    } catch (error) {
        console.error("Generate Flashcards Error:", error);
        res.status(500).json({ error: "Failed to generate flashcards" });
    }
  },

  getFlashcards: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deck = await prisma.flashcardDeck.findFirst({
            where: { resourceId: id },
            orderBy: { createdAt: 'desc' },
            include: { cards: true }
        });
        if (!deck) return res.status(404).json({ error: "Flashcards not found" });
        res.json(deck);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  },

  // Quiz
  generateQuiz: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quiz = await ragService.generateQuiz(id);
        res.json(quiz);
    } catch (error) {
        console.error("Generate Quiz Error:", error);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
  },

  getQuiz: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quiz = await prisma.quiz.findFirst({
            where: { resourceId: id },
            orderBy: { createdAt: 'desc' },
            include: { questions: true }
        });
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quiz" });
    }
  },

  // Notes
  generateNotes: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notes = await ragService.generateNotes(id);
        res.json(notes);
    } catch (error) {
        console.error("Generate Notes Error:", error);
        res.status(500).json({ error: "Failed to generate notes" });
    }
  },

  getNotes: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notes = await prisma.note.findMany({
            where: { resourceId: id },
            orderBy: { createdAt: 'asc' }
        });
        if (!notes || notes.length === 0) return res.status(404).json({ error: "Notes not found" });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
  },

  // Glossary
  generateGlossary: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const glossary = await ragService.generateGlossary(id);
        res.json(glossary);
    } catch (error) {
        console.error("Generate Glossary Error:", error);
        res.status(500).json({ error: "Failed to generate glossary" });
    }
  },

  getGlossary: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const glossary = await prisma.glossaryTerm.findMany({
            where: { resourceId: id },
            orderBy: { term: 'asc' }
        });
        if (!glossary || glossary.length === 0) return res.status(404).json({ error: "Glossary not found" });
        res.json(glossary);
    } catch (error) {
        console.error("Get Glossary Error:", error);
        res.status(500).json({ error: "Failed to fetch glossary" });
    }
  },

  // Exam Prediction
  generatePredictions: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const predictions = await ragService.generateExamPrediction(id);
        res.json(predictions);
    } catch (error) {
        console.error("Generate Predictions Error:", error);
        res.status(500).json({ error: "Failed to generate predictions" });
    }
  },

  getPredictions: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const predictions = await prisma.examPrediction.findMany({
            where: { resourceId: id },
            orderBy: { probability: 'desc' }
        });
        if (!predictions || predictions.length === 0) return res.status(404).json({ error: "Predictions not found" });
        res.json(predictions);
    } catch (error) {
        console.error("Get Predictions Error:", error);
        res.status(500).json({ error: "Failed to fetch predictions" });
    }
  },

  // Repair Lesson
  generateRepairLesson: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { concept } = req.body;

        let weakPoint = await prisma.weakPoint.findFirst({
            where: { resourceId: id, concept: concept }
        });

        if (weakPoint?.repairLesson) {
            console.log("Returning cached repair lesson for:", concept);
            return res.json(weakPoint.repairLesson);
        }

        console.log("Generating new repair lesson for:", concept);
        const lesson = await ragService.generateRepairLesson(id, concept);
        
        if (weakPoint) {
            await prisma.weakPoint.update({
                where: { id: weakPoint.id },
                data: { repairLesson: lesson }
            });
        } else {
             await prisma.weakPoint.create({
                data: {
                    resourceId: id,
                    concept: concept,
                    status: 'Needs Work',
                    mistakeCount: 1,
                    repairLesson: lesson
                }
            });
        }

        res.json(lesson);
    } catch (error) {
        console.error("Generate Repair Lesson Error:", error);
        res.status(500).json({ error: "Failed to generate lesson" });
    }
  },

  // Weak Points
  resolveWeakPoint: async (req: Request, res: Response) => {
    try {
        const { weakPointId } = req.params;
        const updated = await prisma.weakPoint.update({
            where: { id: weakPointId },
            data: { status: 'Mastered' }
        });
        res.json(updated);
    } catch (error) {
        console.error("Resolve Weak Point Error:", error);
        res.status(500).json({ error: "Failed to resolve weak point" });
    }
  },

  getWeakPoints: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const weakPoints = await prisma.weakPoint.findMany({
            where: { resourceId: id },
            orderBy: [
                { status: 'asc' },
                { lastMistake: 'desc' }
            ]
        });
        res.json(weakPoints);
    } catch (error) {
        console.error("Get Weak Points Error:", error);
        res.status(500).json({ error: "Failed to fetch weak points" });
    }
  },

  recordMistake: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { concept } = req.body;
        
        if (!concept) return res.status(400).json({ error: "Concept is required" });

        let weakPoint = await prisma.weakPoint.findFirst({
            where: { resourceId: id, concept: concept }
        });

        if (weakPoint) {
            weakPoint = await prisma.weakPoint.update({
                where: { id: weakPoint.id },
                data: {
                    mistakeCount: { increment: 1 },
                    lastMistake: new Date(),
                    status: 'Needs Work'
                }
            });
        } else {
            weakPoint = await prisma.weakPoint.create({
                data: {
                    resourceId: id,
                    concept: concept,
                    mistakeCount: 1,
                    status: 'Needs Work'
                }
            });
        }

        res.json(weakPoint);
    } catch (error) {
        console.error("Record Mistake Error:", error);
        res.status(500).json({ error: "Failed to record mistake" });
    }
  },

  // Complex Topics
  generateComplexTopics: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const topics = await ragService.identifyComplexTopics(id);
        res.json(topics);
    } catch (error) {
        console.error("Generate Complex Topics Error:", error);
        res.status(500).json({ error: "Failed to identify complex topics" });
    }
  },

  // Auto Complete
  generateAutoComplete: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const completion = await ragService.generateAutoComplete(id, text);
        res.json({ completion });
    } catch (error) {
        console.error("Generate Auto Complete Error:", error);
        res.status(500).json({ error: "Failed to generate completion" });
    }
  },

  // Chat
  chat: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { message, history } = req.body;
        
        if (!message) return res.status(400).json({ error: "Message is required" });

        const response = await ragService.chat(id, message, history || []);
        res.json({ response });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to chat" });
    }
  }
};
