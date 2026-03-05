import Streak from '../models/Streak.js';

export const getStreak = async (req, res) => {
    try {
        let streak = await Streak.findOne({ user: req.user._id });
        if (!streak) {
            streak = await Streak.create({ user: req.user._id });
        }
        res.json(streak);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching streak' });
    }
};
