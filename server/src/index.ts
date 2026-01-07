import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ragService } from './services/rag';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to safely fix encoding
const fixEncoding = (str: string) => {
    // If the string already contains Arabic characters, it's likely already correct (UTF-8)
    if (/[\u0600-\u06FF]/.test(str)) {
        return str;
    }
    
    // Try to decode from Latin1 to UTF8
    try {
        const fixed = Buffer.from(str, 'latin1').toString('utf8');
        // If the fixed string reveals Arabic characters, use it
        if (/[\u0600-\u06FF]/.test(fixed)) {
            return fixed;
        }
    } catch (e) {
        // invalid encoding, ignore
    }
    
    return str;
};

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Fix encoding for Arabic filenames safely
        const originalName = fixEncoding(file.originalname);
        cb(null, uniqueSuffix + '-' + originalName);
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get all subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
        include: { resources: true }
    });
    res.json(subjects);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Create new subject
app.post('/api/subjects', async (req, res) => {
    try {
        const { name, icon, color, userId = "default-user" } = req.body;
        
        // Create user if not exists (temporary logic to ensure we have a user)
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: { email: 'user@example.com', name: 'Default User' }
            });
        }

        const newSubject = await prisma.subject.create({
            data: {
                name,
                icon,
                color,
                userId: user.id
            }
        });
        res.json(newSubject);
    } catch (error) {
        console.error('Create Subject Error:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

// Get Resources
app.get('/api/resources', async (req, res) => {
  try {
      const { subjectId } = req.query;
      console.log(`Fetching resources for subjectId: ${subjectId}`);
      const where = subjectId ? { subjectId: String(subjectId) } : {};
      
      const resources = await prisma.resource.findMany({
          where,
          orderBy: { createdAt: 'desc' }
      });
      
      // Transform for frontend
      const formatted = resources.map(r => ({
            id: r.id,
            name: r.title,
            type: r.type,
            size: r.size || 'Unknown',
            date: r.createdAt.toISOString().split('T')[0]
        }));
        
        res.json(formatted);
  } catch (error) {
      console.error("Get Resources Error:", error);
      res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// Get Single Resource
app.get('/api/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await prisma.resource.findUnique({
            where: { id }
        });
        
        if (!resource) return res.status(404).json({ error: "Resource not found" });

        res.json({
            id: resource.id,
            name: resource.title,
            type: resource.type,
            size: resource.size || 'Unknown',
            date: resource.createdAt.toISOString().split('T')[0]
        });
    } catch (error) {
        console.error("Get Resource Error:", error);
        res.status(500).json({ error: "Failed to fetch resource" });
    }
});

// Upload Resource
app.post('/api/resources/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        // Log the raw body to debug language reception
        console.log("Upload Body:", req.body);

        const { subjectId, language } = req.body;
        if (!subjectId) {
            return res.status(400).json({ error: "Subject ID required" });
        }

        // Fix encoding issue for originalname here as well
        const originalName = fixEncoding(req.file.originalname);

        console.log(`File uploaded: ${req.file.path}, Subject: ${subjectId}, Language: ${language}`);

        // 1. Create Resource Entry in DB
        const resource = await prisma.resource.create({
            data: {
                title: originalName,
                type: path.extname(originalName).replace('.', '').toUpperCase() || 'FILE',
                url: req.file.path, // In local dev, store path. In prod, store S3 URL.
                size: formatBytes(req.file.size),
                subjectId: subjectId,
                language: language || 'English',
                content: '' // Will be filled by RAG service
            }
        });

        // 2. Trigger RAG Processing
        // Only process PDF and Text files for now
        const supportedTypes = ['application/pdf', 'text/plain'];
        if (supportedTypes.includes(req.file.mimetype)) {
            // Process asynchronously in background so we don't block response too long? 
            // For now, keep it sync to ensure it works before returning.
            console.log("Starting RAG processing for", req.file.mimetype);
            try {
                await ragService.processFile(req.file.path, resource.id, req.file.mimetype);
                console.log("RAG processing complete");
            } catch (ragError) {
                console.error("RAG processing failed (non-fatal):", ragError);
                // We don't fail the upload if RAG fails, but we log it.
            }
        }

        res.json(resource);

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
});

// --- RAG & AI Endpoints ---

// 1. Summary
app.post('/api/resources/:id/generate/summary', async (req, res) => {
    try {
        const { id } = req.params;
        const summary = await ragService.summarize(id);
        res.json(summary);
    } catch (error) {
        console.error("Generate Summary Error:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
});

app.get('/api/resources/:id/summary', async (req, res) => {
    try {
        const { id } = req.params;
        const summary = await prisma.summary.findUnique({ where: { resourceId: id } });
        if (!summary) return res.status(404).json({ error: "Summary not found" });
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch summary" });
    }
});

// 2. Flashcards
app.post('/api/resources/:id/generate/flashcards', async (req, res) => {
    try {
        const { id } = req.params;
        const deck = await ragService.generateFlashcards(id);
        res.json(deck);
    } catch (error) {
        console.error("Generate Flashcards Error:", error);
        res.status(500).json({ error: "Failed to generate flashcards" });
    }
});

app.get('/api/resources/:id/flashcards', async (req, res) => {
    try {
        const { id } = req.params;
        // Get the most recent deck for this resource
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
});

// 3. Quiz
app.post('/api/resources/:id/generate/quiz', async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await ragService.generateQuiz(id);
        res.json(quiz);
    } catch (error) {
        console.error("Generate Quiz Error:", error);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
});

app.get('/api/resources/:id/quiz', async (req, res) => {
    try {
        const { id } = req.params;
        // Get the most recent quiz
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
});

// 4. Notes
app.post('/api/resources/:id/generate/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const notes = await ragService.generateNotes(id);
        res.json(notes);
    } catch (error) {
        console.error("Generate Notes Error:", error);
        res.status(500).json({ error: "Failed to generate notes" });
    }
});

app.get('/api/resources/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const notes = await prisma.note.findMany({
            where: { resourceId: id },
            orderBy: { createdAt: 'asc' }
        });
        // If no notes, return 404 to trigger generation UI
        if (!notes || notes.length === 0) return res.status(404).json({ error: "Notes not found" });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// 5. Glossary
app.post('/api/resources/:id/generate/glossary', async (req, res) => {
    try {
        const { id } = req.params;
        const glossary = await ragService.generateGlossary(id);
        res.json(glossary);
    } catch (error) {
        console.error("Generate Glossary Error:", error);
        res.status(500).json({ error: "Failed to generate glossary" });
    }
});

app.get('/api/resources/:id/glossary', async (req, res) => {
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
});

// 6. Exam Prediction
app.post('/api/resources/:id/generate/predictions', async (req, res) => {
    try {
        const { id } = req.params;
        const predictions = await ragService.generateExamPrediction(id);
        res.json(predictions);
    } catch (error) {
        console.error("Generate Predictions Error:", error);
        res.status(500).json({ error: "Failed to generate predictions" });
    }
});

app.get('/api/resources/:id/predictions', async (req, res) => {
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
});

// 7. Repair Lesson
app.post('/api/resources/:id/repair-lesson', async (req, res) => {
    try {
        const { id } = req.params;
        const { concept } = req.body;

        // Check for existing weak point with saved lesson
        let weakPoint = await prisma.weakPoint.findFirst({
            where: { resourceId: id, concept: concept }
        });

        if (weakPoint?.repairLesson) {
            console.log("Returning cached repair lesson for:", concept);
            return res.json(weakPoint.repairLesson);
        }

        console.log("Generating new repair lesson for:", concept);
        const lesson = await ragService.generateRepairLesson(id, concept);
        
        // Save the lesson to the weak point (create if not exists)
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
});

// 7.1 Resolve Weak Point
app.post('/api/resources/:id/weak-points/:weakPointId/resolve', async (req, res) => {
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
});

// 7.2 Get Weak Points
app.get('/api/resources/:id/weak-points', async (req, res) => {
    try {
        const { id } = req.params;
        const weakPoints = await prisma.weakPoint.findMany({
            where: { resourceId: id },
            orderBy: [
                { status: 'asc' }, // 'Needs Work' comes before 'Mastered' alphabetically? No.
                // We might want custom sorting, but for now let's just fetch them.
                { lastMistake: 'desc' }
            ]
        });
        res.json(weakPoints);
    } catch (error) {
        console.error("Get Weak Points Error:", error);
        res.status(500).json({ error: "Failed to fetch weak points" });
    }
});

// 8. Complex Topics (Focus Review)
app.post('/api/resources/:id/generate/complex-topics', async (req, res) => {
    try {
        const { id } = req.params;
        const topics = await ragService.identifyComplexTopics(id);
        res.json(topics);
    } catch (error) {
        console.error("Generate Complex Topics Error:", error);
        res.status(500).json({ error: "Failed to identify complex topics" });
    }
});

// 9. Auto Complete (Smart Notebook)
app.post('/api/resources/:id/generate/autocomplete', async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const completion = await ragService.generateAutoComplete(id, text);
        res.json({ completion });
    } catch (error) {
        console.error("Generate Auto Complete Error:", error);
        res.status(500).json({ error: "Failed to generate completion" });
    }
});

// 10. Mistakes (Focus Review)
app.post('/api/resources/:id/mistakes', async (req, res) => {
    try {
        const { id } = req.params;
        const { concept } = req.body;
        
        if (!concept) return res.status(400).json({ error: "Concept is required" });

        // Check if weak point exists
        let weakPoint = await prisma.weakPoint.findFirst({
            where: {
                resourceId: id,
                concept: concept
            }
        });

        if (weakPoint) {
            // Increment mistake count
            weakPoint = await prisma.weakPoint.update({
                where: { id: weakPoint.id },
                data: {
                    mistakeCount: { increment: 1 },
                    lastMistake: new Date(),
                    status: 'Needs Work'
                }
            });
        } else {
            // Create new
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
});

app.get('/api/resources/:id/mistakes', async (req, res) => {
    try {
        const { id } = req.params;
        const mistakes = await prisma.weakPoint.findMany({
            where: { resourceId: id },
            orderBy: [
                { status: 'asc' }, // Needs Work first
                { mistakeCount: 'desc' }
            ]
        });
        res.json(mistakes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch mistakes" });
    }
});

app.post('/api/resources/:id/mistakes/:mistakeId/resolve', async (req, res) => {
    try {
        const { mistakeId } = req.params;
        const mistake = await prisma.weakPoint.update({
            where: { id: mistakeId },
            data: {
                status: 'Mastered' // Or 'Improving'
            }
        });
        res.json(mistake);
    } catch (error) {
        res.status(500).json({ error: "Failed to resolve mistake" });
    }
});

// 11. AI Chat
app.post('/api/resources/:id/chat', async (req, res) => {
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
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
