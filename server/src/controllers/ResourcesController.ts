import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ragService } from '../services/rag';
import { LessonGenerator } from '../services/LessonGenerator';
import { fixEncoding } from '../utils/encoding';
import path from 'path';

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

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
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                type: true,
                size: true,
                createdAt: true,
                subjectId: true
            }
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
            },
            include: {
                subject: true,
                summary: true
            }
        });
        
        if (!resource) return res.status(404).json({ error: "Resource not found" });

        res.json({
            id: resource.id,
            name: resource.title,
            type: resource.type,
            size: resource.size || 'Unknown',
            status: resource.status || 'READY',
            date: resource.createdAt.toISOString().split('T')[0],
            subjectId: resource.subjectId, 
            subjectName: resource.subject.name,
            content: resource.content,
            summary: resource.summary?.content
        });
    } catch (error) {
        console.error("Get Resource Error:", error);
        res.status(500).json({ error: "Failed to fetch resource" });
    }
  },

  upload: async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        // Check limits
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.role !== 'ADMIN' && user.filesCount >= user.fileLimit) {
             return res.status(403).json({ error: "File limit reached. Upgrade or delete files." });
        }

        const { subjectId, language, name, url, key, size, type } = req.body;
        
        if (!subjectId) {
            return res.status(400).json({ error: "Subject ID required" });
        }

        if (!url || !key) {
             return res.status(400).json({ error: "File data (url/key) missing" });
        }

        const fixedTitle = fixEncoding(name || "Untitled");
        const formattedSize = formatBytes(size || 0);
        
        // Simple type inference if not provided
        let fileType = 'PDF';
        if (type?.includes('text') || name?.endsWith('.txt')) fileType = 'TXT';
        else if (type?.includes('pdf') || name?.endsWith('.pdf')) fileType = 'PDF';

        // 1. Create Resource in DB
        const resource = await prisma.resource.create({
            data: {
                title: fixedTitle,
                type: fileType,
                url: url, // Store UploadThing URL
                size: formattedSize,
                subjectId,
                language: language || 'English',
                content: '' // Will be filled by RAG
            }
        });

        // Update user file count
        await prisma.user.update({
            where: { id: user.id },
            data: { filesCount: { increment: 1 } }
        });

        // 2. Trigger RAG Processing (Async)
        // Since the file is on URL now, we pass the URL to processFile
        // Note: processFile needs to be updated to handle URLs download
        ragService.processFile(url, resource.id, type || 'application/pdf')
            .then(async () => {
                console.log(`[Background] RAG complete for ${resource.id}. Text extraction finished.`);
                // Automatic content generation is disabled per user request.
                // User will trigger generation manually from the UI.
            })
            .catch(err => {
                console.error(`[Background] RAG failed for ${resource.id}:`, err);
            });

        res.status(201).json(resource);

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;

        const resource = await prisma.resource.findUnique({
            where: { id },
            include: { subject: true }
        });

        if (!resource) return res.status(404).json({ error: "Resource not found" });

        // Check ownership or admin
        // Note: req.user.role might need to be casted or checked if it exists on type
        // Assuming authMiddleware adds it.
        const userRole = (req.user as any).role;

        if (resource.subject.userId !== req.user.id && userRole !== 'ADMIN') {
             return res.status(403).json({ error: "Forbidden" });
        }

        // Try to delete from UploadThing
        try {
            // Extract key from URL if possible, or use a stored key field if we had one.
            // URL format: https://utfs.io/f/KEY
            const fileKey = resource.url.split('/').pop();
            if (fileKey) {
                console.log(`Deleting file from UploadThing: ${fileKey}`);
                await utapi.deleteFiles(fileKey);
            }
        } catch (utError) {
            console.error("Failed to delete file from UploadThing:", utError);
            // Continue to delete from DB anyway to avoid zombie records
        }

        await prisma.resource.delete({ where: { id } });

        // Decrement count for the resource owner
        const owner = await prisma.user.findUnique({ where: { id: resource.subject.userId } });
        if (owner && owner.filesCount > 0) {
            await prisma.user.update({
                where: { id: resource.subject.userId },
                data: { filesCount: { decrement: 1 } }
            });
        }

        res.json({ message: "Resource deleted" });
    } catch (error) {
        console.error("Delete Resource Error:", error);
        res.status(500).json({ error: "Failed to delete resource" });
    }
  }
};
