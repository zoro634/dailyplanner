import express from 'express';
import { getStreak } from '../controllers/streakController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStreak);

export default router;
