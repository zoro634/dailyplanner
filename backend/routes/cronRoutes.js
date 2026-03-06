import express from 'express';
import { runDailyCronTask } from '../services/notificationService.js';

const router = express.Router();

// This endpoint will be called by Vercel Cron
router.get('/daily', async (req, res) => {
    try {
        // Optional: Secure this endpoint by requiring an authorization header
        // that matches a secret value stored in your environment variables.
        const authHeader = req.headers.authorization;
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return res.status(401).json({ message: 'Unauthorized access to cron trigger' });
        }

        await runDailyCronTask();
        res.status(200).json({ message: 'Daily cron task executed successfully' });
    } catch (error) {
        console.error('Error executing daily cron via API:', error);
        res.status(500).json({ message: 'Internal server error during cron execution' });
    }
});

export default router;
