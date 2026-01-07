import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ragService } from '../services/rag';
import { fixEncoding } from '../utils/encoding';
import path from 'path';

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const ResourcesController = {
  getAll: async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const { subjectId } = req.query;
        console.log(`Fetching resources for subjectId: ${subjectId}`);
        
        let where: any = {
            subject: {
                userId: req.user.id
            }
        };

        if (subjectId) {
            where.subjectId = String(subjectId);
        }
        
        const resources = await prisma.resource.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        
        // Transform for frontend
        const formatted = resources.map((r: any) => ({
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
  },

  getOne: async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        const resource = await prisma.resource.findFirst({
            where: { 
                id,
                subject: {
                    userId: req.user.id
                }
            }
        });
        
        if (!resource) return res.status(404).json({ error: "Resource not found" });

        res.json({
            id: resource.id,
            name: resource.title,
            type: resource.type,
            size: resource.size || 'Unknown',
            date: resource.createdAt.toISOString().split('T')[0],
            subjectId: resource.subjectId // Add this to help navigation
        });
    } catch (error) {
        console.error("Get Resource Error:", error);
        res.status(500).json({ error: "Failed to fetch resource" });
    }
  },

  upload: async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        const { subjectId, language } = req.body;
        if (!subjectId) {
            return res.status(400).json({ error: "Subject ID required" });
        }

        // Verify Subject Ownership
        const subject = await prisma.subject.findFirst({
            where: {
                id: subjectId,
                userId: req.user.id
            }
        });

        if (!subject) {
            return res.status(403).json({ error: "Invalid subject or permission denied" });
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
  }
};
