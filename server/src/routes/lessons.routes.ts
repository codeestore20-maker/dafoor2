import express from 'express';
import { LessonsController } from '../controllers/LessonsController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/:topicId/step/:type', LessonsController.getStepContent);
router.put('/:topicId/status', LessonsController.updateStatus);

export default router;
