const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        leaveType: {
            type: String,
            enum: ['Sick', 'Casual', 'Vacation'],
            required: [true, 'Please specify leave type'],
        },
        startDate: {
            type: Date,
            required: [true, 'Please provide start date'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please provide end date'],
        },
        totalDays: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        appliedDate: {
            type: Date,
            default: Date.now,
        },
        reason: {
            type: String,
            required: [true, 'Please provide reason for leave'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Leave', leaveSchema);
