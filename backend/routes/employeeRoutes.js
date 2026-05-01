const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Helper: local date string YYYY-MM-DD (timezone-safe)
const toLocalStr = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// Build a Set of working-day leave date strings (excluding Sundays), capped to today
// For Approved leaves: all dates excluded from stats, counted as leaveDays
// For Pending leaves: only today + future dates excluded (past pending = Absent)
const buildExcludedDateSet = (approvedLeaves, pendingLeaves) => {
    const todayStr = toLocalStr(new Date());
    const set = new Set();

    // Approved leaves — all dates up to today excluded
    approvedLeaves.forEach(leave => {
        const startStr = toLocalStr(new Date(leave.startDate));
        const endStr   = toLocalStr(new Date(leave.endDate));
        const capStr   = endStr > todayStr ? todayStr : endStr;

        let cur = new Date(startStr);
        const capDate = new Date(capStr);
        cur.setHours(0, 0, 0, 0);
        capDate.setHours(23, 59, 59, 999);

        while (cur <= capDate) {
            if (cur.getDay() !== 0) set.add(toLocalStr(cur));
            cur.setDate(cur.getDate() + 1);
        }
    });

    // Pending leaves — only TODAY and FUTURE dates excluded from stats
    // (past pending dates should show as Absent, not excluded)
    pendingLeaves.forEach(leave => {
        const startStr = toLocalStr(new Date(leave.startDate));
        const endStr   = toLocalStr(new Date(leave.endDate));

        let cur = new Date(startStr > todayStr ? startStr : todayStr);
        const endDate = new Date(endStr);
        cur.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        while (cur <= endDate) {
            if (cur.getDay() !== 0) set.add(toLocalStr(cur));
            cur.setDate(cur.getDate() + 1);
        }
    });

    return set;
};

// @desc    Get all employees with stats (Admin)
// @route   GET /api/employees
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');

        const employeesWithStats = await Promise.all(
            employees.map(async (employee) => {
                const [attendance, approvedLeaves, pendingLeaves] = await Promise.all([
                    Attendance.find({ userId: employee._id }),
                    Leave.find({ userId: employee._id, status: 'Approved' }),
                    Leave.find({ userId: employee._id, status: 'Pending' }),
                ]);

                // Excluded date set: approved leaves + today/future pending leaves
                const excludedDateSet = buildExcludedDateSet(approvedLeaves, pendingLeaves);

                // Approved-only set for leaveDays count (pending not confirmed)
                const approvedOnlySet = buildExcludedDateSet(approvedLeaves, []);

                // Filter out attendance records on excluded dates
                const nonLeaveAttendance = attendance.filter(
                    a => !excludedDateSet.has(toLocalStr(new Date(a.date)))
                );

                const presentDays = nonLeaveAttendance.filter(a => a.status === 'Present').length;
                const absentDays  = nonLeaveAttendance.filter(a => a.status === 'Absent').length;
                const leaveDays   = approvedOnlySet.size;
                const totalDays   = presentDays + absentDays + leaveDays;

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
                    leaveDays,
                };
            })
        );

        res.json(employeesWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
