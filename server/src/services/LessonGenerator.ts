import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { ragService } from './rag';

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

export const LessonGenerator = {
  /**
   * 1. Extract Topics from a Resource (Course Map)
   * This function analyzes the file content and creates Topic entries in the DB.
   */
  extractTopics: async (resourceId: string) => {
    try {
      console.log(`[LessonGenerator] Extracting topics for ${resourceId}...`);
      
      // Get content (ensure it's processed)
      const { content, language } = await ragService.ensureContent(resourceId);
      const cleanText = ragService.cleanContext(content);

      // Limit context to avoid token limits.
      // Taking the first 30k chars is usually enough to capture the table of contents and structure.
      const textContext = cleanText.substring(0, 30000);

      const prompt = `
        You are an expert curriculum designer. 
        Analyze the provided educational content and extract a structured list of learning topics (chapters/lessons).
        
        For each topic, provide:
        - title: Engaging title in ${language} (Translate if needed)
        - difficulty: Localized difficulty level (e.g. "سهل", "متوسط", "صعب")
        - timeEstimate: Localized time (e.g. "5 دقائق")
        - relevance: A score 0-100 based on importance/frequency in the text.
        
        The topics should follow the logical flow of the document.
        
        Output JSON format:
        {
          "topics": [
            { "title": "...", "difficulty": "...", "timeEstimate": "...", "relevance": ... }
          ]
        }
        
        Target Audience Language: ${language} (Ensure the topic titles are in this language).
        CRITICAL: Keep technical terms in English ONLY if the subject is strictly programming/code, otherwise translate everything to ${language}.
        
        For Difficulty: Use localized terms ("سهل", "متوسط", "صعب") if the language is Arabic.
        For TimeEstimate: Use localized terms (e.g. "5 دقائق") if the language is Arabic.
      `;

      const completion = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: `Here is the document content (first part):\n\n---\n${textContext}\n---`
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || "{}");
      const topicsData = response.topics || [];

      console.log(`[LessonGenerator] Found ${topicsData.length} topics.`);

      // Save to DB (Smart Sync: Upsert to preserve progress)
      const savedTopics: any[] = [];
      
      for (const t of topicsData) {
        // Check if topic exists by title and resourceId
        const existing = await prisma.topic.findFirst({
            where: {
                resourceId,
                title: t.title
            }
        });

        if (existing) {
            // Update metadata but keep status/progress
            const updated = await prisma.topic.update({
                where: { id: existing.id },
                data: {
                    difficulty: t.difficulty,
                    timeEstimate: t.timeEstimate,
                    relevance: t.relevance
                }
            });
            savedTopics.push(updated);
        } else {
            // Create new
            const createdTopic = await prisma.topic.create({
                data: {
                    resourceId,
                    title: t.title,
                    difficulty: t.difficulty,
                    timeEstimate: t.timeEstimate,
                    relevance: t.relevance,
                    status: savedTopics.length === 0 ? "ready" : "locked" // First one unlocked
                }
            });
            savedTopics.push(createdTopic);
        }
      }

      return savedTopics;

    } catch (error) {
      console.error("[LessonGenerator] Topic Extraction Error:", error);
      throw error;
    }
  },

  /**
   * 2. Generate Content for a Specific Topic Step
   * This creates the interactive content (Intro -> Explanation -> Question -> Outro)
   */
  generateStepContent: async (topicId: string, stepType: 'intro' | 'explanation' | 'question' | 'outro') => {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: { resource: true }
      });

      if (!topic) throw new Error("Topic not found");

      // Check if step already exists
      const existingStep = await prisma.lessonStep.findFirst({
        where: { topicId, type: stepType }
      });
      if (existingStep) return JSON.parse(existingStep.content);

      // For MVP, we pass the document context (first 20k chars).
      // In a real production app, we would use embeddings to find the most relevant chunk for this specific topic.
      const { content, language } = await ragService.ensureContent(topic.resourceId);
      const cleanText = ragService.cleanContext(content).substring(0, 20000); 

      const promptMap: any = {
        intro: `
          Create a "Briefing Paper" Introduction for the topic: "${topic.title}".
          Target Audience: Students (Saudi Najdi Dialect - Friendly but structured).
          
          Goal: Explain WHY this topic matters in the real world and define key terms.
          
          Strict Output JSON: 
          { 
            "markdown": "Write a clear, simple, and engaging introduction to the topic (3-4 sentences). Focus on what the student is about to learn and why it's interesting. Avoid storytelling style.",
            "hook": "One powerful sentence explaining why this topic is critical for real life or career.",
            "keyTerms": [
              "Term 1 (Definition in 3 words)",
              "Term 2 (Definition in 3 words)",
              "Term 3 (Definition in 3 words)"
            ],
            "quote": "An inspiring or relevant short quote about this topic (or general learning/success) in Arabic.",
            "quickFact": "A surprising or interesting 'Did you know?' fact related to this topic."
          }
        `,
        explanation: `
          You are a master tutor creating a "Living Notebook" for a student.
          Topic: "${topic.title}"
          Language: Saudi Najdi Dialect (friendly, clear, engaging).
          
          Goal: Create a structured, engaging lesson with 4-6 distinct SECTIONS.
          
          STRICT OUTPUT FORMAT (JSON):
          {
            "lessonSections": [
              {
                "title": "Start with a Hook (catchy title)",
                "content": "Markdown text explaining the core concept simply. Use analogies.",
                "icon": "star" // Options: star, alert, bulb, question
              },
              {
                "title": "The Core Concept",
                "content": "Detailed explanation. Use **bold** for key terms.",
                "icon": "bulb"
              },
              {
                "title": "Real World Example",
                "content": "Explain a real scenario where this applies.",
                "icon": "star"
              },
              {
                "title": "Watch Out!",
                "content": "Common mistakes or important warnings.",
                "icon": "alert"
              }
            ]
          }
          
          GUIDELINES:
          1. Each section should be a complete thought.
          2. Use emojis and friendly tone ("شف يا بطل", "الزبدة").
          3. Keep it visual and organized.
        `,
        question: `
          Create a set of multiple-choice questions to test understanding of "${topic.title}".
          Language: Saudi Najdi Dialect (لهجة سعودية نجدية).
          Difficulty Level: ${topic.difficulty || "Medium"}
          
          Number of questions required:
          - Easy: 2 questions
          - Medium: 3 questions
          - Hard: 4 questions
          
          Output JSON: {
            "questions": [
              {
                "question": "...", 
                "options": ["A", "B", "C", "D"], 
                "correctIndex": 0, 
                "explanation": "Scientific explanation of why this is correct (Fact only, no congrats).",
                "successMessage": "Encouraging phrase like 'كفو!' or 'صح عليك!'"
              }
            ]
          }
        `,
        outro: `
          Create a "Cheat Sheet" Summary for the topic: "${topic.title}".
          Language: Saudi Najdi Dialect.
          
          Output JSON:
          {
            "keyPoints": [
              "Point 1 (Core Concept understood)",
              "Point 2 (How it works)",
              "Point 3 (Why it matters)"
            ],
            "goldenRule": "One single sentence that summarizes the most important takeaway (The Golden Rule).",
            "nextSteps": [
              "Action 1 (e.g. Solve a problem about X)",
              "Action 2 (e.g. Review term Y)"
            ]
          }
        `
      };

      const prompt = promptMap[stepType];

      const completion = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: `Context from study material:\n${cleanText}...\n\nTopic: ${topic.title}` 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const contentResponse = completion.choices[0].message.content || "{}";
      
      // CRITICAL: Double-check if step was created while we were generating (Race Condition Fix)
      const raceStep = await prisma.lessonStep.findFirst({
        where: { topicId, type: stepType }
      });
      
      if (raceStep) {
          console.log(`[LessonGenerator] Race condition detected for ${topicId}/${stepType}. Using existing step.`);
          return JSON.parse(raceStep.content);
      }

      // Save step to DB
      await prisma.lessonStep.create({
        data: {
          topicId,
          type: stepType,
          content: contentResponse,
          order: stepType === 'intro' ? 1 : stepType === 'explanation' ? 2 : stepType === 'question' ? 3 : 4
        }
      });

      return JSON.parse(contentResponse);

    } catch (error) {
      console.error("[LessonGenerator] Step Generation Error:", error);
      throw error;
    }
  }
};
