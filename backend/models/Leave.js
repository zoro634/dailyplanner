import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    date: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

leaveSchema.index({ user: 1, date: 1 }, { unique: true });

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
