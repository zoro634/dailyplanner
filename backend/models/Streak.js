import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true,
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    lastActivityDate: {
        type: Date,
    },
    totalStudyDays: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const Streak = mongoose.model('Streak', streakSchema);
export default Streak;
