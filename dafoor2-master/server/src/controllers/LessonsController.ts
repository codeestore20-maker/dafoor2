import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { LessonGenerator } from '../services/LessonGenerator';

export const LessonsController = {
  // Get all topics for a resource. Triggers extraction if missing.
  getTopics: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // Resource ID
      
      // Check if topics exist
      const topics = await prisma.topic.findMany({
        where: { resourceId: id },
        // For now order by creation time to maintain sequence from extraction
        orderBy: { createdAt: 'asc' } 
      });

      if (topics.length > 0) {
        return res.json(topics);
      }

      // If no topics, DO NOT generate automatically. Return empty array.
      // Generation must be triggered manually via /generate/topics
      console.log("[LessonsController] No topics found. Returning empty array.");
      res.json([]);

    } catch (error) {
      console.error("Get Topics Error:", error);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  },

  // Explicitly generate topics (for manual trigger)
  generateTopics: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log(`[LessonsController] Manually generating topics for ${id}...`);
      const topics = await LessonGenerator.extractTopics(id);
      res.json(topics);
    } catch (error) {
      console.error("Generate Topics Error:", error);
      res.status(500).json({ error: "Failed to generate topics" });
    }
  },

  // Get content for a specific step
  getStepContent: async (req: Request, res: Response) => {
    try {
      const { topicId, type } = req.params;
      
      console.log(`[LessonsController] Fetching step: ${type} for topic: ${topicId}`);

      // Allow 'outro' as well
      if (!['intro', 'explanation', 'question', 'outro'].includes(type)) {
        return res.status(400).json({ error: "Invalid step type" });
      }

      // Check if step exists
      const step = await prisma.lessonStep.findFirst({
        where: { topicId, type }
      });

      if (step) {
        console.log(`[LessonsController] Step found in DB: ${step.id}`);
        try {
            const content = JSON.parse(step.content);
            return res.json(content);
        } catch (e) {
            // If content is not JSON, return as markdown object
            return res.json({ markdown: step.content });
        }
      }

      console.log(`[LessonsController] Step NOT found. Generating...`);

      // Generate if missing
      const content = await LessonGenerator.generateStepContent(topicId, type as any);
      res.json(content);

    } catch (error) {
      console.error("Get Step Content Error:", error);
      res.status(500).json({ error: "Failed to fetch step content" });
    }
  },

  // Update topic status
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { topicId } = req.params;
      const { status } = req.body; // "ready", "completed"

      const updated = await prisma.topic.update({
        where: { id: topicId },
        data: { status }
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  }
};
