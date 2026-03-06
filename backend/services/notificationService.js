import cron from 'node-cron';
import nodemailer from 'nodemailer';
import TelegramBot from 'node-telegram-bot-api';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Streak from '../models/Streak.js';
import Leave from '../models/Leave.js';
import { startOfDay, endOfDay, isBefore } from 'date-fns';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
}

export const runDailyCronTask = async () => {
    console.log('Running daily notification and streak evaluation task via API...');
    try {
        const users = await User.find({});
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);

        for (const user of users) {
            // 1. Check if user is on leave today
            const leaveToday = await Leave.findOne({
                user: user._id,
                date: { $gte: start, $lte: end }
            });

            if (leaveToday) {
                console.log(`User ${user.username} is on leave. Skipping streak update and notification.`);
                continue;
            }

            // 2. Evaluate tasks for today
            const tasks = await Task.find({
                user: user._id,
                date: { $gte: start, $lte: end }
            });

            const pendingTasks = tasks.filter(t => !t.completed);
            const allCompleted = tasks.length > 0 && pendingTasks.length === 0;

            // 3. Update Streak
            let streak = await Streak.findOne({ user: user._id });
            if (!streak) {
                streak = new Streak({ user: user._id });
            }

            if (allCompleted) {
                // Check if streak is broken (no activity yesterday, excluding leaves)
                streak.currentStreak += 1;
                if (streak.currentStreak > streak.longestStreak) {
                    streak.longestStreak = streak.currentStreak;
                }
                streak.totalStudyDays += 1;
                streak.lastActivityDate = today;
                await streak.save();
            } else if (tasks.length > 0 && pendingTasks.length > 0) {
                // Tasks were missed, streak broken
                streak.currentStreak = 0;
                await streak.save();

                // Send pending tasks notification
                await sendNotifications(user, pendingTasks);
            }
        }
    } catch (error) {
        console.error('Error in daily cron task:', error);
        throw error; // Throw error to be caught by the API route
    }
};

export const initCronJobs = () => {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        console.log('Initializing local cron jobs...');
        // Every day at 10 PM
        cron.schedule('0 22 * * *', async () => {
            console.log('Local node-cron triggered.');
            await runDailyCronTask();
        });
    }
};

const sendNotifications = async (user, pendingTasks) => {
    let taskListStr = pendingTasks.map(t => `- ${t.section}: ${t.topic}`).join('\n');
    let message = `CAT Prep Reminder!\n\nYou have ${pendingTasks.length} pending tasks for today:\n${taskListStr}\n\nDon't break your momentum! Keep pushing forward!`;

    // Email
    if (process.env.SMTP_USER && process.env.NOTIFICATION_EMAIL) {
        try {
            await transporter.sendMail({
                from: `"CAT Study Tracker" <${process.env.SMTP_USER}>`,
                to: process.env.NOTIFICATION_EMAIL,
                subject: 'Pending CAT Study Tasks',
                text: message,
            });
            console.log(`Email sent to ${process.env.NOTIFICATION_EMAIL}`);
        } catch (error) {
            console.error('Failed to send email:', error.message);
        }
    }

    // Telegram
    if (bot && process.env.TELEGRAM_CHAT_ID) {
        try {
            await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
            console.log(`Telegram message sent to ${process.env.TELEGRAM_CHAT_ID}`);
        } catch (error) {
            console.error('Failed to send Telegram message:', error.message);
        }
    }
};
