import express from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth and admin check to all routes
router.use(authMiddleware, isAdmin);

router.get('/users', AdminController.getUsers);
router.delete('/users/:id', AdminController.deleteUser);
router.put('/users/:id/limits', AdminController.updateUserLimits);
router.get('/resources', AdminController.getAllResources);
router.get('/users/:userId/resources', AdminController.getUserResources);

export default router;
