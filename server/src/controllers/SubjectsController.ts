import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const SubjectsController = {
  getAll: async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const subjects = await prisma.subject.findMany({
        where: { userId: req.user.id },
        include: { resources: true }
      });
      res.json(subjects);
    } catch (error) {
      console.error('DB Error:', error);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const { name, icon, color } = req.body;
      
      const newSubject = await prisma.subject.create({
        data: {
          name,
          icon,
          color,
          userId: req.user.id
        }
      });
      res.json(newSubject);
    } catch (error) {
      console.error('Create Subject Error:', error);
      res.status(500).json({ error: 'Failed to create subject' });
    }
  }
};
