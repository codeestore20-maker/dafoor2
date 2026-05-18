import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const AdminController = {
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          fileLimit: true,
          messageLimit: true,
          filesCount: true,
          messagesCount: true,
          _count: {
            select: {
              subjects: true,
              chatSessions: true
            }
          }
        }
      });
      res.json(users);
    } catch (error) {
      console.error("Get Users Error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Prevent deleting self
      if (req.user?.id === id) {
          return res.status(400).json({ error: "Cannot delete yourself" });
      }

      await prisma.user.delete({ where: { id } });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete User Error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },

  updateUserLimits: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { fileLimit, messageLimit } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: {
          fileLimit: Number(fileLimit),
          messageLimit: Number(messageLimit)
        }
      });

      res.json(user);
    } catch (error) {
      console.error("Update Limits Error:", error);
      res.status(500).json({ error: "Failed to update limits" });
    }
  },

  getAllResources: async (req: Request, res: Response) => {
      try {
          const resources = await prisma.resource.findMany({
              orderBy: { createdAt: 'desc' },
              include: {
                  subject: {
                      include: {
                          user: {
                              select: { email: true, name: true }
                          }
                      }
                  }
              }
          });

          const formatted = resources.map(r => ({
              id: r.id,
              title: r.title,
              type: r.type,
              size: r.size,
              date: r.createdAt,
              owner: r.subject.user.email,
              ownerName: r.subject.user.name,
              subjectName: r.subject.name
          }));

          res.json(formatted);
      } catch (error) {
          console.error("Get All Resources Error:", error);
          res.status(500).json({ error: "Failed to fetch resources" });
      }
  },
  getUserResources: async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const resources = await prisma.resource.findMany({
            where: {
                subject: {
                    userId: userId
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                subject: true
            }
        });

        const formatted = resources.map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            size: r.size,
            date: r.createdAt,
            subjectName: r.subject.name
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Get User Resources Error:", error);
        res.status(500).json({ error: "Failed to fetch user resources" });
    }
  }
};
