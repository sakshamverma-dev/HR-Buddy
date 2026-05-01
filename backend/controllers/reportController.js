const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require('../models/Leave');

// Helper: local date string YYYY-MM-DD
const toLocalDateStr = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// @desc    Get monthly attendance report
// @route   GET /api/reports/monthly
// @access  Private/Admin
const getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ message: 'Invalid month. Must be between 1 and 12' });
        }

        // Date range for the month
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
        const totalCalendarDays = endDate.getDate();

        // Count working days in the month (excluding Sundays)
        let totalWorkingDays = 0;
        let wd = new Date(yearNum, monthNum - 1, 1);
        while (wd <= endDate) {
            if (wd.getDay() !== 0) totalWorkingDays++;
            wd.setDate(wd.getDate() + 1);
        }

        // Get all employees (excluding admin)
        const employees = await User.find({ role: 'employee' }).select('fullName email');

        // Get attendance records for the month
        const attendanceRecords = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('userId', 'fullName email');

        // Get approved leaves that overlap with this month
        const leaveRecords = await Leave.find({
            status: 'Approved',
            startDate: { $lte: endDate },
            endDate:   { $gte: startDate },
        });

        // Build leave day sets per employee
        const employeeLeaveDays = {}; // userId -> Set of dateStr
        leaveRecords.forEach(leave => {
            const uid = leave.userId.toString();
            if (!employeeLeaveDays[uid]) employeeLeaveDays[uid] = new Set();

            const start = new Date(leave.startDate > startDate ? leave.startDate : startDate);
            const end   = new Date(leave.endDate < endDate ? leave.endDate : endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            let cur = new Date(start);
            while (cur <= end) {
                if (cur.getDay() !== 0) { // skip Sundays
                    employeeLeaveDays[uid].add(toLocalDateStr(cur));
                }
                cur.setDate(cur.getDate() + 1);
            }
        });

        // Build report data
        const reportData = employees.map(employee => {
            const uid = employee._id.toString();

            // Filter attendance for this employee
            const empAttendance = attendanceRecords.filter(
                r => r.userId && r.userId._id.toString() === uid
            );

            const presentDays = empAttendance.filter(r => r.status === 'Present').length;
            const absentDays  = empAttendance.filter(r => r.status === 'Absent').length;
            const leaveDays   = (employeeLeaveDays[uid] || new Set()).size;

            // Working days available to this employee (excluding their leave days)
            const effectiveWorkingDays = totalWorkingDays - leaveDays;
            const totalRecorded = presentDays + absentDays;

            // Attendance % = Present / (Working days - Leave days)
            const attendancePercentage = effectiveWorkingDays > 0
                ? ((presentDays / effectiveWorkingDays) * 100).toFixed(2)
                : 0;

            return {
                employeeId: uid,
                fullName: employee.fullName,
                email: employee.email,
                totalDays: totalWorkingDays,
                effectiveDays: effectiveWorkingDays,
                presentDays,
                absentDays,
                leaveDays,
                unrecordedDays: effectiveWorkingDays - totalRecorded < 0 ? 0 : effectiveWorkingDays - totalRecorded,
                attendancePercentage: parseFloat(attendancePercentage),
            };
        });

        // Overall statistics
        const totalEmployees = reportData.length;
        const avgAttendance = totalEmployees > 0
            ? (reportData.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / totalEmployees).toFixed(2)
            : 0;
        const totalPresentDays = reportData.reduce((sum, emp) => sum + emp.presentDays, 0);
        const totalAbsentDays  = reportData.reduce((sum, emp) => sum + emp.absentDays, 0);
        const totalLeaveDays   = reportData.reduce((sum, emp) => sum + emp.leaveDays, 0);

        res.status(200).json({
            month: monthNum,
            year: yearNum,
            totalWorkingDays,
            statistics: {
                totalEmployees,
                averageAttendance: parseFloat(avgAttendance),
                totalPresentDays,
                totalAbsentDays,
                totalLeaveDays,
            },
            employees: reportData,
        });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ message: 'Server error while generating report' });
    }
};

module.exports = { getMonthlyReport };
