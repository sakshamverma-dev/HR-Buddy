const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total employees (excluding admins)
        const totalEmployees = await User.countDocuments({ role: 'employee' });

        // Pending leave requests
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

        // Today's attendance - Present count
        const todayPresent = await Attendance.countDocuments({
            date: today,
            status: 'Present',
        });

        // Today's attendance - Absent count
        const todayAbsent = await Attendance.countDocuments({
            date: today,
            status: 'Absent',
        });

        res.json({
            totalEmployees,
            pendingLeaves,
            todayPresent,
            todayAbsent,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
