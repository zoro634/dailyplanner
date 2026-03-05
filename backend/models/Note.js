import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    date: {
        type: Date,
        required: true,
    },
    plan: {
        type: String,
        default: '',
    },
    studied: {
        type: String,
        default: '',
    },
    mistakesSummary: {
        type: String,
        default: '',
    },
    tomorrowFocus: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

noteSchema.index({ user: 1, date: 1 }, { unique: true });

const Note = mongoose.model('Note', noteSchema);
export default Note;
