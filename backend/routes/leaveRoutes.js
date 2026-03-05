import express from 'express';
import { getLeaves, markLeave, deleteLeave } from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getLeaves)
    .post(protect, markLeave);

router.route('/:id')
    .delete(protect, deleteLeave);

export default router;
