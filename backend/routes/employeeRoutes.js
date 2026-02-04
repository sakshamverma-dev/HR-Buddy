const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @desc    Get all employees with stats (Admin)
// @route   GET /api/employees
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        // Get all employees (not admins)
        const employees = await User.find({ role: 'employee' }).select('-password');

        // Get attendance stats for each employee
        const employeesWithStats = await Promise.all(
            employees.map(async (employee) => {
                const attendance = await Attendance.find({ userId: employee._id });

                const totalDays = attendance.length;
                const presentDays = attendance.filter(a => a.status === 'Present').length;
                const absentDays = attendance.filter(a => a.status === 'Absent').length;

                return {
                    _id: employee._id,
                    fullName: employee.fullName,
                    email: employee.email,
                    role: employee.role,
                    jobRole: employee.jobRole,
                    dateOfJoining: employee.dateOfJoining,
                    leaveBalance: employee.leaveBalance,
                    totalDays,
                    presentDays,
                    absentDays,
                };
            })
        );

        res.json(employeesWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
