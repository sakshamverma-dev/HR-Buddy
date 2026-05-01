const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Helper: local date string YYYY-MM-DD (timezone-safe)
const toLocalStr = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = toLocalStr(today);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Total employees (excluding admins)
        const totalEmployees = await User.countDocuments({ role: 'employee' });

        // Pending leave requests
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

        // Find employees who are on APPROVED leave today — exclude from Present/Absent
        const approvedLeavesToday = await Leave.find({
            status: 'Approved',
            startDate: { $lte: todayEnd },
            endDate:   { $gte: today },
        }).select('userId');
        const onLeaveUserIds = approvedLeavesToday.map(l => l.userId.toString());

        // Today's attendance records
        const todayAttendance = await Attendance.find({
            date: { $gte: today, $lte: todayEnd },
        }).select('userId status');

        // Filter out employees who are on approved leave today
        const filteredAttendance = todayAttendance.filter(
            a => !onLeaveUserIds.includes(a.userId.toString())
        );

        const todayPresent = filteredAttendance.filter(a => a.status === 'Present').length;
        const todayAbsent  = filteredAttendance.filter(a => a.status === 'Absent').length;
        const todayOnLeave = onLeaveUserIds.length;

        res.json({
            totalEmployees,
            pendingLeaves,
            todayPresent,
            todayAbsent,
            todayOnLeave,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
