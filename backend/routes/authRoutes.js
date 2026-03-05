import express from 'express';
import { loginUser, createAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/setup-admin', createAdmin);

export default router;
