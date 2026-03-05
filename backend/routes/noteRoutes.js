import express from 'express';
import { getNoteByDate, createOrUpdateNote } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:date')
    .get(protect, getNoteByDate)
    .post(protect, createOrUpdateNote)
    .put(protect, createOrUpdateNote);

export default router;
