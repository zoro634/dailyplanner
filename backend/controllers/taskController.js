import Task from '../models/Task.js';
import { parseExcelFile } from '../services/excelService.js';
import { endOfDay, startOfDay } from 'date-fns';

export const getTasks = async (req, res) => {
    try {
        const { date } = req.query;
        let query = { user: req.user._id };

        if (date) {
            const queryDate = new Date(date);
            query.date = {
                $gte: startOfDay(queryDate),
                $lte: endOfDay(queryDate)
            };
        }

        const tasks = await Task.find(query).sort({ date: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching tasks' });
    }
};

export const createTask = async (req, res) => {
    try {
        const { date, section, topic, description, estimatedTime } = req.body;

        const task = new Task({
            user: req.user._id,
            date,
            section,
            topic,
            description,
            estimatedTime
        });

        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(400).json({ message: 'Invalid task data', error: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            // check ownership
            if (task.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this task' });
            }

            task.date = req.body.date || task.date;
            task.section = req.body.section || task.section;
            task.topic = req.body.topic || task.topic;
            task.description = req.body.description || task.description;
            task.estimatedTime = req.body.estimatedTime || task.estimatedTime;

            if (req.body.completed !== undefined) {
                task.completed = req.body.completed;
            }

            const updatedTask = await task.save();

            // Update streak if task completion status changed
            // (Streak logic can be separated into a service, but keeping it unified for now or hook it up)

            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating task' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            if (task.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this task' });
            }

            await task.deleteOne();
            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting task' });
    }
};

export const uploadExcelTasks = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel file' });
        }

        const { tasks, errors } = parseExcelFile(req.file.buffer);

        if (tasks.length === 0) {
            return res.status(400).json({ message: 'No valid tasks found in the file', errors });
        }

        // Attach user to tasks
        const tasksWithUser = tasks.map(t => ({
            ...t,
            user: req.user._id
        }));

        const result = await Task.insertMany(tasksWithUser);

        res.status(201).json({
            message: `${result.length} tasks imported successfully`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error importing tasks', error: error.message });
    }
};
