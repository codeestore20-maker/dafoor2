
import express from 'express';
import { TicketController } from '../controllers/TicketController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Public (Authenticated User) Routes
router.post('/', authMiddleware, TicketController.create);

// Admin Routes (Should add admin check middleware ideally)
router.get('/', authMiddleware, TicketController.getAll);
router.patch('/:id/status', authMiddleware, TicketController.updateStatus);

export default router;
