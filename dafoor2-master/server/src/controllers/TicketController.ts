
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const TicketController = {
  // Create a new ticket
  create: async (req: Request, res: Response) => {
    try {
      const { message, subject } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ticket = await prisma.ticket.create({
        data: {
          userId,
          message,
          subject,
          status: 'OPEN'
        }
      });

      return res.json(ticket);
    } catch (error) {
      console.error('Create Ticket Error:', error);
      return res.status(500).json({ error: 'Failed to create ticket' });
    }
  },

  // Get all tickets (for admin)
  getAll: async (req: Request, res: Response) => {
    try {
      const tickets = await prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      return res.json(tickets);
    } catch (error) {
      console.error('Get Tickets Error:', error);
      return res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  },

  // Update ticket status
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const ticket = await prisma.ticket.update({
        where: { id },
        data: { status }
      });

      return res.json(ticket);
    } catch (error) {
      console.error('Update Ticket Error:', error);
      return res.status(500).json({ error: 'Failed to update ticket' });
    }
  }
};
