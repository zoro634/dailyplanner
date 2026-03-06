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
import cronRoutes from './routes/cronRoutes.js';
import { initCronJobs } from './services/notificationService.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Global cache for MongoDB connection in Serverless environments
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cat-study-tracker', {
            // These options ensure Mongoose doesn't build a huge connection pool and handles timeouts gracefully in Serverless
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB connected (Serverless cached)');
        initCronJobs(); // Note: this will still run locally, but not on Vercel API routes
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Add a middleware to ensure database connection on every request
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/cron', cronRoutes);

app.get('/', (req, res) => {
    res.send('CAT Study Tracker API is running on Vercel...');
});

// Only listen locally if not in a Vercel/production serverless environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

export default app;
