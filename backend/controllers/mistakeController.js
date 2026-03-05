import Mistake from '../models/Mistake.js';

export const getMistakes = async (req, res) => {
    try {
        const mistakes = await Mistake.find({ user: req.user._id }).sort({ date: -1 });
        res.json(mistakes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createMistake = async (req, res) => {
    try {
        const { date, topic, description } = req.body;

        const mistake = new Mistake({
            user: req.user._id,
            date,
            topic,
            description
        });

        const createdMistake = await mistake.save();
        res.status(201).json(createdMistake);
    } catch (error) {
        res.status(400).json({ message: 'Invalid mistake data' });
    }
};

export const deleteMistake = async (req, res) => {
    try {
        const mistake = await Mistake.findById(req.params.id);

        if (mistake) {
            if (mistake.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            await mistake.deleteOne();
            res.json({ message: 'Mistake removed' });
        } else {
            res.status(404).json({ message: 'Mistake not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
