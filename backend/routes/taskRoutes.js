import express from 'express';
import multer from 'multer';
import { getTasks, createTask, updateTask, deleteTask, uploadExcelTasks } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .get(protect, getTasks)
    .post(protect, createTask);

router.post('/upload', protect, upload.single('file'), uploadExcelTasks);

router.route('/:id')
    .put(protect, updateTask)
    .delete(protect, deleteTask);

export default router;
