import Note from '../models/Note.js';

export const getNoteByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const note = await Note.findOne({ user: req.user._id, date: new Date(date) });
        if (note) {
            res.json(note);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching note' });
    }
};

export const createOrUpdateNote = async (req, res) => {
    try {
        const { date, plan, studied, mistakesSummary, tomorrowFocus } = req.body;

        let note = await Note.findOne({ user: req.user._id, date: new Date(date) });

        if (note) {
            note.plan = plan !== undefined ? plan : note.plan;
            note.studied = studied !== undefined ? studied : note.studied;
            note.mistakesSummary = mistakesSummary !== undefined ? mistakesSummary : note.mistakesSummary;
            note.tomorrowFocus = tomorrowFocus !== undefined ? tomorrowFocus : note.tomorrowFocus;

            const updatedNote = await note.save();
            res.json(updatedNote);
        } else {
            note = new Note({
                user: req.user._id,
                date: new Date(date),
                plan,
                studied,
                mistakesSummary,
                tomorrowFocus
            });
            const createdNote = await note.save();
            res.status(201).json(createdNote);
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid note data' });
    }
};
