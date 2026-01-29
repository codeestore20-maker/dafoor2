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
   * Improved: Now processes the FULL file using chunking and multi-stage refinement.
   */
  extractTopics: async (resourceId: string) => {
    try {
      console.log(`[LessonGenerator] Extracting topics for ${resourceId}...`);
      
      // Get content (ensure it's processed)
      const { content, language } = await ragService.ensureContent(resourceId);
      const cleanText = ragService.cleanContext(content);
      
      console.log(`[LessonGenerator] Content length: ${cleanText.length} chars. Starting full-file analysis.`);

      // 1. Split text into manageable chunks (e.g., 25k chars ~ 10 pages)
      const chunks = await ragService.splitTextIntoChunks(cleanText, 25000);
      console.log(`[LessonGenerator] Split into ${chunks.length} chunks for analysis.`);

      // 2. Parallel Extraction: Analyze each chunk to find "Candidate Topics"
      // We process chunks in batches to avoid rate limits
      const chunkPromises = chunks.map(async (chunk, index) => {
        try {
          const completion = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [
              { 
                role: "system", 
                content: `Analyze this text segment (Part ${index + 1}/${chunks.length}) of a larger document.\n\n---\n${chunk}\n---` 
              },
              { 
                role: "user", 
                content: `Extract the main learning topics/chapters from this text.
                Target Language: ${language} (Translate titles if needed).
                
                CRITICAL: You MUST extract at least 3-5 distinct topics/themes from this text, even if they are not explicitly labeled as chapters.
                If the text is unstructured, identify the main key concepts discussed.
                
                For each topic found, estimate:
                - title: Clear, concise title.
                - volume: Approximate number of sentences/points covered in this chunk (Integer).
                - difficulty: "Easy", "Medium", "Hard" (based on complexity of text).
                
                Output JSON: { "topics": [{ "title": "...", "volume": 10, "difficulty": "Easy" }] }`
              }
            ],
            response_format: { type: "json_object" }
          });
          const content = completion.choices[0].message.content || "{}";
          // console.log(`[LessonGenerator] Chunk ${index} raw response:`, content.substring(0, 100) + "..."); 
          const res = JSON.parse(content);
          if (!res.topics || res.topics.length === 0) {
             console.warn(`[LessonGenerator] Chunk ${index} returned 0 topics. Raw:`, content);
          }
          return (res.topics || []).map((t: any) => ({ ...t, chunkIndex: index }));
        } catch (e) {
          console.error(`[LessonGenerator] Error processing chunk ${index}:`, e);
          return [];
        }
      });

      // Execute in parallel (limited concurrency could be better, but for <20 chunks usually ok)
      const allCandidatesNested = await Promise.all(chunkPromises);
      const allCandidates = allCandidatesNested.flat();

      console.log(`[LessonGenerator] Found ${allCandidates.length} candidate topics from all chunks.`);

      // FALLBACK: If no candidates found (e.g. strict JSON fail or unstructured text), force extraction from first chunk
      if (allCandidates.length === 0) {
          console.log("[LessonGenerator] No topics found. Attempting Rescue Extraction on first chunk...");
          try {
              const rescueCompletion = await deepseek.chat.completions.create({
                  model: "deepseek-chat",
                  messages: [
                      { role: "system", content: "You are a helpful assistant." },
                      { role: "user", content: `Extract 3 main topics from this text. Return JSON: { "topics": [{"title": "...", "volume": 5, "difficulty": "Easy"}] }\n\nText: ${chunks[0].substring(0, 5000)}` }
                  ],
                  response_format: { type: "json_object" }
              });
              const rescueRes = JSON.parse(rescueCompletion.choices[0].message.content || "{}");
              if (rescueRes.topics) {
                  allCandidates.push(...rescueRes.topics.map((t: any) => ({ ...t, chunkIndex: 0 })));
                  console.log(`[LessonGenerator] Rescue successful. Found ${allCandidates.length} topics.`);
              }
          } catch (e) {
              console.error("[LessonGenerator] Rescue failed:", e);
          }
      }

      // 3. Refinement & Normalization: Deduplicate and Structure
      // We send the list of candidates to the LLM to create the final coherent course map.
      const refinementPrompt = `
        You are an expert curriculum designer. 
        I have extracted a list of "Candidate Topics" from a book by analyzing it chunk-by-chunk.
        The list may contain duplicates, split topics, or redundant entries.
        
        Your Task:
        1. Merge duplicate topics (e.g., "Intro to Physics" and "Introduction to Physics").
        2. Consolidate scattered content (if "Newton's Laws" appears in Chunk 1 and Chunk 5, combine them).
        3. Estimate final 'Time' and 'Difficulty' based on the TOTAL volume/frequency of the topic.
           - High volume/complexity -> "Hard", Long time.
           - Low volume/simplicity -> "Easy", Short time.
        4. Sort them logically following the book's flow.
        
        Input Candidates: ${JSON.stringify(allCandidates.map(c => ({ title: c.title, volume: c.volume, chunk: c.chunkIndex })))}

        Output JSON format:
        {
          "topics": [
            { 
              "title": "...", 
              "difficulty": "سهل" | "متوسط" | "صعب" (Localized to ${language}),
              "timeEstimate": "...", (e.g. "15 دقائق", Localized to ${language})
              "relevance": 0-100 (Score based on importance/volume)
            }
          ]
        }
      `;

      const refinementCompletion = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a master curriculum organizer." },
          { role: "user", content: refinementPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const finalResponse = JSON.parse(refinementCompletion.choices[0].message.content || "{}");
      const finalTopics = finalResponse.topics || [];

      console.log(`[LessonGenerator] Finalized ${finalTopics.length} topics after refinement.`);

      // 4. Save to DB
      const savedTopics: any[] = [];
      
      // Optional: Clean up old topics if we are re-generating? 
      // User didn't ask to delete, but typically a re-scan implies a refresh. 
      // For now, we'll upsert based on title to preserve existing progress if possible,
      // but "Smart Sync" is safer.
      
      for (const t of finalTopics) {
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
                    status: 'locked'
                }
            });
            savedTopics.push(createdTopic);
        }
      }

      return savedTopics;

    } catch (error) {
      console.error("[LessonGenerator] Extraction Error:", error);
      throw error;
    }
  },

  /**
   * 2. Generate Content for a Specific Topic Step
   * This creates the interactive content (Intro -> Explanation -> Question -> Outro)
   * Improved: Locates the specific chunk containing the topic instead of just reading the start.
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
      
      if (existingStep) {
          const content = JSON.parse(existingStep.content);
          
          // FIX: If this is a 'question' step (Challenge), validate the question count.
          // The user reported an issue where 9 questions appear (likely from old generation or hallucinations).
          // We enforce the limit here. If it violates, we DELETE and RE-GENERATE.
          if (stepType === 'question' && content.questions && content.questions.length > 5) {
              console.log(`[LessonGenerator] Found invalid question count (${content.questions.length}) for topic ${topicId}. Regenerating...`);
              await prisma.lessonStep.delete({ where: { id: existingStep.id } });
              // Fall through to generation logic...
          } else {
              return content;
          }
      }

      // Intelligent Context Retrieval
      const { content, language } = await ragService.ensureContent(topic.resourceId);
      const cleanText = ragService.cleanContext(content);
      
      // Split into chunks to find the relevant section
      // OPTIMIZATION: Reduced chunk size from 25k to 15k to improve focus and reduce hallucinations/waste.
      // 15k chars is approx 5-7 pages, which is ideal for a single lesson context.
      const chunks = await ragService.splitTextIntoChunks(cleanText, 15000);
      
      // Find the most relevant chunk
      // Simple heuristic: Count occurrence of topic title words in the chunk
      let bestChunkIndex = 0;
      let maxScore = -1;
      
      const titleKeywords = topic.title.split(' ').filter(w => w.length > 3); // Ignore short words

      chunks.forEach((chunk, index) => {
        let score = 0;
        const lowerChunk = chunk.toLowerCase();
        
        // Boost if exact title appears
        if (lowerChunk.includes(topic.title.toLowerCase())) score += 50;

        // Add points for keywords
        titleKeywords.forEach(kw => {
            if (lowerChunk.includes(kw.toLowerCase())) score += 1;
        });

        if (score > maxScore) {
            maxScore = score;
            bestChunkIndex = index;
        }
      });

      console.log(`[LessonGenerator] Topic "${topic.title}" mapped to Chunk ${bestChunkIndex} (Score: ${maxScore})`);
      
      // Use the best chunk + padding (if available) for context
      // We take the best chunk, and if it's not the first, maybe the previous one for context?
      // Actually, just the best chunk is usually enough for 25k chars.
      const relevantContext = chunks[bestChunkIndex];

          // Pre-calculate exact question count to save tokens and prevent waste
          let questionPromptExtra = "";
          let targetQuestionCount = 3; // Default for prompt

          if (stepType === 'question') {
              const diff = topic.difficulty?.toLowerCase() || "";
              if (diff.includes("easy") || diff.includes("سهل")) targetQuestionCount = 2;
              else if (diff.includes("hard") || diff.includes("صعب")) targetQuestionCount = 4;
              
              questionPromptExtra = `
              CRITICAL INSTRUCTION: You MUST generate EXACTLY ${targetQuestionCount} questions. 
              Do NOT generate more than ${targetQuestionCount}. 
              Do NOT generate fewer than ${targetQuestionCount}.
              Generating more is considered an error.
              `;
          }

      const promptMap: any = {
        intro: `
          Create a "Briefing Paper" Introduction for the topic: "${topic.title}".
          Target Audience: Students (Saudi Najdi Dialect - Friendly but structured).
          
          Goal: Explain WHY this topic matters in the real world and define key terms.

          CRITICAL TERMINOLOGY RULE: 
          - Keep important technical terms in **English**. 
          - For difficult or new terms, add a short Arabic meaning in parentheses **only the first time** they are mentioned. 
          - Example: "The **Mitral Valve** (الصمام التاجي) controls blood flow..." -> later just use "**Mitral Valve**".
          
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

          CRITICAL TERMINOLOGY RULE: 
          - Keep important technical terms in **English**. 
          - For difficult or new terms, add a short Arabic meaning in parentheses **only the first time** they are mentioned. 
          - Example: "The **Mitral Valve** (الصمام التاجي) controls blood flow..." -> later just use "**Mitral Valve**".
          
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
          
          ${questionPromptExtra}
          
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

          CRITICAL TERMINOLOGY RULE: 
          - Keep important technical terms in **English**. 
          - For difficult or new terms, add a short Arabic meaning in parentheses **only the first time** they are mentioned. 
          
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
            content: `Context from study material:\n${relevantContext}...\n\nTopic: ${topic.title}` 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      let contentResponse = completion.choices[0].message.content || "{}";
      
      // CRITICAL: Double-check if step was created while we were generating (Race Condition Fix)
      const raceStep = await prisma.lessonStep.findFirst({
        where: { topicId, type: stepType }
      });
      
      if (raceStep) {
          console.log(`[LessonGenerator] Race condition detected for ${topicId}/${stepType}. Using existing step.`);
          return JSON.parse(raceStep.content);
      }

      // Enforce Limit on Questions (Post-Processing)
      let finalContent = JSON.parse(contentResponse);
      if (stepType === 'question' && finalContent.questions && Array.isArray(finalContent.questions)) {
          const limitMap: any = { 'Easy': 2, 'Medium': 3, 'Hard': 4 };
          // Map Arabic difficulty to English keys if needed, or just use defaults
          // Assuming topic.difficulty might be "سهل" or "Easy"
          let limit = 4; // Default max
          
          const diff = topic.difficulty?.toLowerCase() || "";
          if (diff.includes("easy") || diff.includes("سهل")) limit = 2;
          else if (diff.includes("medium") || diff.includes("متوسط")) limit = 3;
          else if (diff.includes("hard") || diff.includes("صعب")) limit = 4;

          if (finalContent.questions.length > limit) {
              // This should rarely happen now with the improved prompt and reduced context window
              console.log(`[LessonGenerator] Warning: LLM generated ${finalContent.questions.length} questions, expected ${limit}. Truncating.`);
              finalContent.questions = finalContent.questions.slice(0, limit);
              contentResponse = JSON.stringify(finalContent);
          } else if (finalContent.questions.length < limit) {
               console.log(`[LessonGenerator] Notice: LLM generated fewer questions (${finalContent.questions.length}) than limit (${limit}). Accepting.`);
          } else {
               console.log(`[LessonGenerator] Success: Generated exactly ${limit} questions.`);
          }
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

      return finalContent;

    } catch (error) {
      console.error("[LessonGenerator] Step Generation Error:", error);
      throw error;
    }
  },

  /**
   * 3. Pre-generate All Content (Background Process)
   * This triggers the full pipeline: Extract Topics -> Generate Content for ALL topics.
   * Designed to run immediately after file upload.
   */
  preGenerateAllContent: async (resourceId: string) => {
      console.log(`[LessonGenerator] Starting Full Pre-generation for ${resourceId}...`);
      try {
          // 1. Extract Topics (this will create them in DB)
          const topics = await LessonGenerator.extractTopics(resourceId);
          console.log(`[LessonGenerator] Extracted ${topics.length} topics. Starting content generation...`);

          // 2. Generate Content for each topic
          // CRITICAL: We process topics SEQUENTIALLY to prevent "ECONNRESET" and rate limits.
          // Parallel processing (Promise.all) was causing connection drops with DeepSeek/OpenAI.
          for (let i = 0; i < topics.length; i++) {
              const topic = topics[i];
              console.log(`[LessonGenerator] Processing Topic ${i + 1}/${topics.length}: "${topic.title}"`);

              // Generate steps SEQUENTIALLY for stability
              try {
                  await LessonGenerator.generateStepContent(topic.id, 'intro');
                  await new Promise(r => setTimeout(r, 500)); // Brief pause
                  
                  await LessonGenerator.generateStepContent(topic.id, 'explanation');
                  await new Promise(r => setTimeout(r, 500)); 

                  await LessonGenerator.generateStepContent(topic.id, 'question');
                  await new Promise(r => setTimeout(r, 500)); 

                  await LessonGenerator.generateStepContent(topic.id, 'outro');
                  await new Promise(r => setTimeout(r, 1000)); // Longer pause between topics
              } catch (e) {
                  console.error(`[LessonGenerator] Failed to generate content for topic ${topic.id}, skipping...`, e);
              }
          }

          console.log(`[LessonGenerator] Full Pre-generation COMPLETED for ${resourceId}`);
          
          return true;
      } catch (error) {
          console.error(`[LessonGenerator] Pre-generation Failed for ${resourceId}:`, error);
          return false;
      }
  }
};
