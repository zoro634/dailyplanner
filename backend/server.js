import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import mistakeRoutes from './routes/mistakeRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import { initCronJobs } from './services/notificationService.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cat-study-tracker')
    .then(() => {
        console.log('MongoDB connected');
        initCronJobs();
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/streaks', streakRoutes);

app.get('/', (req, res) => {
    res.send('CAT Study Tracker API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
