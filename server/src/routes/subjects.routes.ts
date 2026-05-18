import express from 'express';
import { SubjectsController } from '../controllers/SubjectsController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', SubjectsController.getAll);
router.post('/', SubjectsController.create);

export default router;
