const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: [true, 'Please provide date'],
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: [true, 'Please specify attendance status'],
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
