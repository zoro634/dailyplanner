import express from 'express';
import { getMistakes, createMistake, deleteMistake } from '../controllers/mistakeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getMistakes)
    .post(protect, createMistake);

router.route('/:id')
    .delete(protect, deleteMistake);

export default router;
