import { prisma } from '../lib/prisma';
import OpenAI from 'openai';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from 'fs';
import path from 'path';

// Initialize DeepSeek Client
// Strategy: We leverage DeepSeek's Context Caching by sending the full, cleaned document text as a prefix.
// This allows us to support large files (up to ~150k chars) with minimal cost for subsequent requests (chat, quiz, etc.)
// because the input tokens are cached.
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

export const ragService = {
  processFile: async (filePath: string, resourceId: string, mimeType: string) => {
    try {
      console.log(`[RAG] Processing file: ${filePath} (${mimeType}) for resource ${resourceId}`);
      
      // Ensure absolute path
      const absolutePath = path.resolve(filePath);
      console.log(`[RAG] Absolute path: ${absolutePath}`);

      if (!fs.existsSync(absolutePath)) {
          console.error(`[RAG] File not found at path: ${absolutePath}`);
          throw new Error(`File not found: ${absolutePath}`);
      }

      let docs;
      
      // 1. Load File based on Type
      if (mimeType === 'application/pdf') {
        console.log("[RAG] Loading PDF...");
        const loader = new PDFLoader(absolutePath, {
            splitPages: false,
        });
        docs = await loader.load();
        console.log(`[RAG] PDF loaded. Pages: ${docs.length}`);
      } else if (mimeType === 'text/plain') {
        console.log("[RAG] Loading Text file...");
        const text = fs.readFileSync(absolutePath, 'utf-8');
        // Create a mock document structure
        docs = [{ pageContent: text, metadata: { source: filePath } }];
        console.log(`[RAG] Text loaded. Length: ${text.length}`);
      } else {
        console.warn(`[RAG] Unsupported MIME type: ${mimeType}`);
        return 0;
      }

      if (!docs || docs.length === 0) {
          console.warn("[RAG] No content extracted from file.");
          return 0;
      }

      // Update resource with full extracted text
      const fullText = docs.map(d => d.pageContent).join('\n');
      console.log(`[RAG] Total extracted text length: ${fullText.length}`);

      if (fullText.length < 10) {
          console.warn("[RAG] Extracted text is suspiciously short.");
      }

      await prisma.resource.update({
        where: { id: resourceId },
        data: { content: fullText } 
      });
      console.log("[RAG] Resource content updated in DB.");

      // 2. Split Text (for future embedding)
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splits = await splitter.splitDocuments(docs);
      console.log(`[RAG] Split into ${splits.length} chunks.`);
      
      return splits.length;

    } catch (error) {
      console.error("[RAG] Processing Error:", error);
      throw error; 
    }
  },

  ensureContent: async (resourceId: string) => {
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new Error("Resource not found");

    console.log(`[RAG] EnsureContent for ${resourceId}. Language: ${resource.language}`);

    if (resource.content && resource.content.length > 10) {
        return { content: resource.content, language: resource.language || 'English' };
    }

    if (resource.url) {
        console.log(`[Recovery] Content missing for ${resourceId}. Attempting to re-process from ${resource.url}`);
        try {
            let mimeType = 'application/octet-stream';
            // Simple inference
            if (resource.url.toLowerCase().endsWith('.pdf') || resource.type === 'PDF') mimeType = 'application/pdf';
            else if (resource.url.toLowerCase().endsWith('.txt') || resource.type === 'TXT') mimeType = 'text/plain';
            
            await ragService.processFile(resource.url, resourceId, mimeType);
            
            const updated = await prisma.resource.findUnique({ where: { id: resourceId } });
            if (!updated?.content) throw new Error("Content still empty after processing");
            return { content: updated.content, language: updated.language || 'English' };
        } catch (e) {
            console.error("[Recovery] Failed:", e);
            throw new Error("Resource content missing and recovery failed.");
        }
    }
    
    throw new Error("Resource content not found");
  },

  // Helper to clean context and reduce token usage
  cleanContext: (text: string): string => {
    return text
        .replace(/[\r\n]+/g, '\n') // Compress multiple newlines aggressively
        .replace(/[ \t]+/g, ' ')   // Compress spaces
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .trim();
  },

  summarize: async (resourceId: string) => {
    try {
      // 1. Fetch resource content
      const { content: contentText, language } = await ragService.ensureContent(resourceId);
      
      // Clean and limit text - Optimized to 80k chars to prevent context overflow
      const text = ragService.cleanContext(contentText).substring(0, 80000); 

      // 3. Call DeepSeek
      const completion = await deepseek.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are an expert academic tutor. Summarize the following text in a structured, engaging Markdown format. Include a title, key concepts, and a 'Key Takeaways' section. Use clear headings.
            
            IMPORTANT: The summary MUST be in ${language}.
            CRITICAL: You must keep key technical terms, specific terminology, and important concepts in their original language (usually English). Do not translate these specific terms, but explain them in ${language}.` 
          },
          { role: "user", content: text }
        ],
        model: "deepseek-chat", 
      });

      const summaryText = completion.choices[0].message.content || "No summary generated.";

      // 4. Save to DB
      // Check if summary exists first
      const existing = await prisma.summary.findUnique({ where: { resourceId } });
      if (existing) {
        return await prisma.summary.update({
          where: { resourceId },
          data: { content: summaryText }
        });
      } else {
        return await prisma.summary.create({
          data: {
            resourceId,
            content: summaryText,
            keyTakeaways: [], // Parsing this would be next level, keeping empty for now
            readingTime: Math.ceil(summaryText.length / 1000) // Rough estimate
          }
        });
      }
    } catch (error) {
      console.error("Summarization Error:", error);
      throw error;
    }
  },

  generateFlashcards: async (resourceId: string) => {
    try {
      const { content: contentText, language } = await ragService.ensureContent(resourceId);

      const text = ragService.cleanContext(contentText).substring(0, 150000);

      const completion = await deepseek.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are a teacher creating flashcards. Output valid JSON array of objects with 'front' and 'back' keys. Create 5-10 cards based on the text. Do not include markdown formatting in the JSON output, just raw JSON.
            
            IMPORTANT: The flashcards MUST be in ${language}.
            CRITICAL: You must keep key technical terms, specific terminology, and important concepts in their original language (usually English). Do not translate these specific terms, but explain them in ${language}.
            
            Do NOT include prefixes like "Question:", "Answer:", "Front:", or "Back:" in the content.
            
            JSON Example:
            [
              {
                "front": "What is [Term]?",
                "back": "Definition of [Term]..."
              }
            ]` 
          }, 
          { role: "user", content: `Generate flashcards from this text: ${text}` }
        ],
        model: "deepseek-chat",
        response_format: { type: "json_object" } 
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No flashcards generated");

      let cardsData;
      try {
        // DeepSeek sometimes returns { "flashcards": [...] } or just [...]
        const parsed = JSON.parse(content);
        cardsData = Array.isArray(parsed) ? parsed : (parsed.flashcards || parsed.cards || []);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        // Fallback: Try to find JSON array in text
        const match = content.match(/\[.*\]/s);
        if (match) {
            cardsData = JSON.parse(match[0]);
        } else {
            throw new Error("Failed to parse flashcards JSON");
        }
      }

      // Create Deck
      const deck = await prisma.flashcardDeck.create({
        data: {
          title: "Generated Deck",
          resourceId: resourceId
        }
      });

      // Create Cards
      for (const card of cardsData) {
        await prisma.flashcard.create({
          data: {
            deckId: deck.id,
            front: card.front,
            back: card.back
          }
        });
      }

      return await prisma.flashcardDeck.findUnique({
        where: { id: deck.id },
        include: { cards: true }
      });

    } catch (error) {
      console.error("Flashcard Generation Error:", error);
      throw error;
    }
  },
  
  generateQuiz: async (resourceId: string) => {
    try {
      const { content: contentText, language } = await ragService.ensureContent(resourceId);

      const text = ragService.cleanContext(contentText).substring(0, 150000);

      const completion = await deepseek.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: `You are a teacher creating a multiple choice quiz. Output valid JSON array of objects with keys: 'text' (question), 'options' (array of 4 strings), 'correctAnswer' (index 0-3), 'explanation', 'concept' (short topic name). Create 5 questions.
              
              IMPORTANT: The questions and explanations MUST be in ${language}.
              CRITICAL: You must keep key technical terms, specific terminology, and important concepts in their original language (usually English). Do not translate these specific terms, but explain them in ${language}.` 
            },
            { role: "user", content: `Generate quiz from this text: ${text}` }
          ],
          model: "deepseek-chat",
          response_format: { type: "json_object" } 
        });
  
        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No quiz generated");
  
        let questionsData;
        try {
            const parsed = JSON.parse(content);
            questionsData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);
        } catch (e) {
            throw new Error("Failed to parse quiz JSON");
        }
  
        // Create Quiz
        const quiz = await prisma.quiz.create({
            data: {
                resourceId: resourceId,
                title: "Generated Quiz"
            }
        });
  
        // Create Questions
        for (const q of questionsData) {
            await prisma.question.create({
                data: {
                    quizId: quiz.id,
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    concept: q.concept
                }
            });
        }
  
        return await prisma.quiz.findUnique({
            where: { id: quiz.id },
            include: { questions: true }
        });
  
      } catch (error) {
        console.error("Quiz Generation Error:", error);
        throw error;
      }
  },

  generateNotes: async (resourceId: string) => {
    try {
      const { content: contentText, language } = await ragService.ensureContent(resourceId);

      const text = ragService.cleanContext(contentText).substring(0, 150000);

      const completion = await deepseek.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are a top student taking notes. Output valid JSON array of strings, where each string is a key concept, formula, or important fact from the text. Keep them concise.
            
            IMPORTANT: The notes MUST be in ${language}.
            CRITICAL: You must keep key technical terms, specific terminology, and important concepts in their original language (usually English). Do not translate these specific terms, but explain them in ${language}.` 
          },
          { role: "user", content: `Take notes from this text: ${text}` }
        ],
        model: "deepseek-chat",
        response_format: { type: "json_object" } 
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No notes generated");

      let notesData;
      try {
          const parsed = JSON.parse(content);
          notesData = Array.isArray(parsed) ? parsed : (parsed.notes || parsed.concepts || []);
      } catch (e) {
          throw new Error("Failed to parse notes JSON");
      }

      // Store notes. We can store them as individual Note entries or one big Note. 
      // The current Note model has 'content' (String). 
      // Let's store each point as a separate Note for now, or maybe grouped.
      // Actually, SmartNotes UI expects a list of strings. 
      // Let's create one Note entry per generated point to allow granular management later? 
      // Or just one Note entry with JSON stringified content? 
      // The Note model is simple. Let's create multiple notes.
      
      const createdNotes = [];
      for (const noteText of notesData) {
        const note = await prisma.note.create({
            data: {
                resourceId: resourceId,
                content: noteText
            }
        });
        createdNotes.push(note);
      }

      return createdNotes;

    } catch (error) {
        console.error("Notes Generation Error:", error);
        throw error;
      }
  },

  generateGlossary: async (resourceId: string) => {
    try {
      const { content: contentText, language } = await ragService.ensureContent(resourceId);
      const text = ragService.cleanContext(contentText).substring(0, 150000);

      const completion = await deepseek.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `Extract key terms and definitions from the text. Return a JSON array of objects with keys: 'term', 'definition'. Limit to 10-15 terms.
            
            IMPORTANT: The definitions MUST be in ${language}.
            CRITICAL: The 'term' itself MUST remain in its original language (usually English). Do NOT translate the term name.
            
            Example:
            [
              { "term": "Photosynthesis", "definition": "العملية التي تستخدمها النباتات..." }
            ]` 
          },
          { role: "user", content: `Text: ${text}` }
        ],
        model: "deepseek-chat",
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No glossary generated");
      
      let termsData;
      try {
          const parsed = JSON.parse(content);
          termsData = Array.isArray(parsed) ? parsed : (parsed.terms || parsed.glossary || []);
      } catch (e) {
          throw new Error("Failed to parse glossary JSON");
      }

      const createdTerms = [];
      for (const item of termsData) {
        const term = await prisma.glossaryTerm.create({
            data: {
                resourceId,
                term: item.term,
                definition: item.definition
            }
        });
        createdTerms.push(term);
      }
      return createdTerms;

    } catch (error) {
        console.error("Glossary Generation Error:", error);
        throw error;
    }
  },

  generateExamPrediction: async (resourceId: string) => {
    try {
        const { content: contentText, language } = await ragService.ensureContent(resourceId);
        const text = ragService.cleanContext(contentText).substring(0, 150000);
  
        const completion = await deepseek.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: `Predict potential exam topics/questions based on the text. Return a JSON array of objects with keys: 'topic' (string), 'probability' (number 0-100), 'reasoning' (string), 'keyConcepts' (array of strings), 'frequency' (string: 'High', 'Medium', 'Low').
              
              IMPORTANT: The reasoning and topics MUST be in ${language}.
              CRITICAL: Keep 'keyConcepts' and technical terms in their original language (usually English).` 
            },
            { role: "user", content: `Analyze this text for exam predictions: ${text}` }
          ],
          model: "deepseek-chat",
          response_format: { type: "json_object" }
        });
  
        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No predictions generated");

        let predictionsData;
        try {
            const parsed = JSON.parse(content);
            predictionsData = Array.isArray(parsed) ? parsed : (parsed.predictions || parsed.topics || []);
        } catch (e) {
            throw new Error("Failed to parse predictions JSON");
        }
  
        const createdPredictions = [];
        for (const item of predictionsData) {
            const prediction = await prisma.examPrediction.create({
                data: {
                    resourceId,
                    topic: item.topic,
                    probability: item.probability,
                    reasoning: item.reasoning,
                    keyConcepts: item.keyConcepts || [],
                    frequency: item.frequency
                }
            });
            createdPredictions.push(prediction);
        }
        return createdPredictions;
    } catch (error) {
        console.error("Exam Prediction Error:", error);
        throw error;
    }
  },

  generateRepairLesson: async (resourceId: string, concept: string) => {
    try {
        const { content: contentText, language } = await ragService.ensureContent(resourceId);
        
        // Find relevant context from the text (simple substring or vector search if I had it set up fully, 
        // but for now let's just use the concept + full text context limit)
        const text = ragService.cleanContext(contentText).substring(0, 150000); 

        const completion = await deepseek.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `You are an expert tutor. Create a mini-lesson for the concept: "${concept}". 
                    Return a JSON object with:
                    - 'breakdown': A clear explanation of the concept in ${language}.
                    - 'misconception': Common misconception in ${language}.
                    - 'mnemonic': A memory aid in ${language} (but keep terms original).
                    - 'practiceQuestion': A multiple choice question object { text, options: [], correctAnswerIndex } in ${language}.
                    
                    CRITICAL: Keep key technical terms in their original language (usually English) throughout the lesson. Do not translate the concept name itself if it is a technical term.`
                },
                { role: "user", content: `Context text: ${text}` }
            ],
            model: "deepseek-chat",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No lesson generated");
        return JSON.parse(content);
    } catch (error) {
        console.error("Repair Lesson Error:", error);
        throw error;
    }
  },

  generateAutoComplete: async (resourceId: string, currentText: string) => {
    try {
      const { content: contentText, language } = await ragService.ensureContent(resourceId);
      const context = contentText.substring(0, 5000);

      const completion = await deepseek.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are a helpful study assistant completing the user's notes. 
            Based on the context provided, complete the user's sentence or add a relevant fact.
            Keep it concise (1-2 sentences). Do not repeat the user's text, just append to it.
            
            IMPORTANT: Complete the text in ${language}, unless the user is writing in a different language.
            CRITICAL: If adding technical terms, keep them in their original language (usually English).` 
          },
          { role: "user", content: `Context: ${context}\n\nUser's current notes: "${currentText}"\n\nComplete this:` }
        ],
        model: "deepseek-chat",
      });

      return completion.choices[0].message.content || "";
    } catch (error) {
      console.error("Auto Complete Error:", error);
      throw error;
    }
  },

  identifyComplexTopics: async (resourceId: string) => {
    try {
        const { content: contentText, language } = await ragService.ensureContent(resourceId);
        const text = ragService.cleanContext(contentText).substring(0, 80000);

        const completion = await deepseek.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Identify complex or advanced topics in the text that students might struggle with. Return a JSON array of objects with keys: 'concept', 'reason' (why it's hard). Limit to 5-8 topics.
                    IMPORTANT: The 'reason' MUST be in ${language}.
                    CRITICAL: The 'concept' MUST remain in its original language.`
                },
                { role: "user", content: `Analyze: ${text}` }
            ],
            model: "deepseek-chat",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No complex topics identified");
        
        let topicsData;
        try {
            const parsed = JSON.parse(content);
            topicsData = Array.isArray(parsed) ? parsed : (parsed.topics || parsed.concepts || []);
        } catch (e) {
            throw new Error("Failed to parse topics JSON");
        }

        return topicsData;

    } catch (error) {
        console.error("Complex Topics Error:", error);
        throw error;
    }
  },

  chat: async (resourceId: string, query: string, history: { role: 'user' | 'assistant', content: string }[]) => {
    try {
        const { content: contentText, language } = await ragService.ensureContent(resourceId);
        // Optimized context window to ~80k chars (approx 25k tokens)
        const context = ragService.cleanContext(contentText).substring(0, 80000);
        
        // Keep only last 6 messages
        const recentHistory = history.slice(-6).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant' as const, 
            content: msg.content
        }));

        const messages: any[] = [
            {
                role: "system",
                content: `You are Professor Owl, a wise and academic AI tutor.
                
                CORE INSTRUCTIONS:
                1. **SOURCE OF TRUTH**: Use the provided "Study Material" as your knowledge base. Do NOT invent facts.
                2. **TEACHING STYLE**: Do NOT just copy-paste. Digest the information and explain it in your own words. Use analogies and simple examples to make it stick.
                3. **ADAPTABILITY**: 
                   - If the user asks a simple question (e.g., "What is X?"), give a concise, direct answer.
                   - If the user asks for an explanation (e.g., "Explain X"), provide a detailed breakdown with examples.
                4. **ENGAGEMENT**: Always end your response with a short, relevant follow-up question to guide the student (e.g., "Does that make sense?", "Shall we look at an example?", "Ready for the next part?").
                5. **LANGUAGE**: Explain in ${language}. Keep technical English terms in brackets if helpful.
                6. **NO EMOTIONS**: Do NOT write actions like (laughs), *smiles*, or (thinks). Express friendliness through words only.
                
                Tone: Professional yet friendly. Use "White Saudi/Modern Standard Arabic" mix (e.g., use "حياك", "تفضل", "ممتاز" but keep sentences grammatically correct). Avoid heavy slang.`
            },
            { role: "user", content: `Here is the Study Material you must base your answers on:\n\n---\n${context}\n---\n\nI am ready for your questions.` },
            { role: "assistant", content: "Understood! I have read the material and I am ready to help you understand it using only the facts provided, while explaining them simply." },
            ...recentHistory,
            { role: "user", content: query }
        ];

        const completion = await deepseek.chat.completions.create({
            messages: messages,
            model: "deepseek-chat",
            temperature: 0.3, 
        });

        return completion.choices[0].message.content || "Hoot! I'm having trouble thinking right now.";

    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
  },

  // Streaming Chat Function
  chatStream: async (resourceId: string, query: string, history: { role: 'user' | 'assistant', content: string }[]) => {
    try {
        const { content: contentText, language } = await ragService.ensureContent(resourceId);
        const context = ragService.cleanContext(contentText).substring(0, 80000);
        
        const recentHistory = history.slice(-6).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant' as const, 
            content: msg.content
        }));

        const messages: any[] = [
            {
                role: "system",
                content: `You are Professor Owl, a wise and academic AI tutor.
                
                CORE INSTRUCTIONS:
                1. **SOURCE OF TRUTH**: Use the provided "Study Material" as your knowledge base. Do NOT invent facts.
                2. **TEACHING STYLE**: Do NOT just copy-paste. Digest the information and explain it in your own words. Use analogies and simple examples to make it stick.
                3. **ADAPTABILITY**: 
                   - If the user asks a simple question (e.g., "What is X?"), give a concise, direct answer.
                   - If the user asks for an explanation (e.g., "Explain X"), provide a detailed breakdown with examples.
                4. **ENGAGEMENT**: Always end your response with a short, relevant follow-up question to guide the student (e.g., "Does that make sense?", "Shall we look at an example?", "Ready for the next part?").
                5. **LANGUAGE**: Explain in ${language}. Keep technical English terms in brackets if helpful.
                
                Tone: Encouraging, scholarly, but accessible. Like a friendly professor chatting in office hours.`
            },
            { role: "user", content: `Here is the Study Material you must base your answers on:\n\n---\n${context}\n---\n\nI am ready for your questions.` },
            { role: "assistant", content: "Understood! I have read the material and I am ready to help you understand it using only the facts provided, while explaining them simply." },
            ...recentHistory,
            { role: "user", content: query }
        ];

        // Return the stream directly
        return await deepseek.chat.completions.create({
            messages: messages,
            model: "deepseek-chat",
            temperature: 0.3,
            stream: true, // Enable Streaming
        });

    } catch (error) {
        console.error("Chat Stream Error:", error);
        throw error;
    }
  }
};

