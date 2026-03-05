import Leave from '../models/Leave.js';
import Streak from '../models/Streak.js';

export const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user._id }).sort({ date: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const markLeave = async (req, res) => {
    try {
        const { date, reason } = req.body;

        const leaveExists = await Leave.findOne({ user: req.user._id, date: new Date(date) });
        if (leaveExists) {
            return res.status(400).json({ message: 'Leave already marked for this date' });
        }

        const leave = new Leave({
            user: req.user._id,
            date: new Date(date),
            reason
        });

        const createdLeave = await leave.save();

        // We update the streak's lastActivityDate so that the streak is maintained naturally
        // since streak checks happen daily at 10 PM. If a leave is recorded for today, streak is paused.

        res.status(201).json(createdLeave);
    } catch (error) {
        res.status(400).json({ message: 'Invalid leave data' });
    }
};

export const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (leave) {
            if (leave.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            await leave.deleteOne();
            res.json({ message: 'Leave removed' });
        } else {
            res.status(404).json({ message: 'Leave not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
