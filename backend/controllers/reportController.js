const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get monthly attendance report
// @route   GET /api/reports/monthly
// @access  Private/Admin
const getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ message: 'Invalid month. Must be between 1 and 12' });
        }

        // Calculate date range for the month
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

        // Calculate total working days in month
        const totalDaysInMonth = endDate.getDate();

        // Get all employees (excluding admin)
        const employees = await User.find({ role: 'employee' }).select('fullName email');

        // Get attendance records for the month
        const attendanceRecords = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('userId', 'fullName email');

        // Build report data
        const reportData = employees.map(employee => {
            // Filter attendance for this employee
            const employeeAttendance = attendanceRecords.filter(
                record => record.userId && record.userId._id.toString() === employee._id.toString()
            );

            // Count present and absent days
            const presentDays = employeeAttendance.filter(record => record.status === 'Present').length;
            const absentDays = employeeAttendance.filter(record => record.status === 'Absent').length;
            const totalRecordedDays = presentDays + absentDays;

            // Calculate attendance percentage
            const attendancePercentage = totalRecordedDays > 0
                ? ((presentDays / totalRecordedDays) * 100).toFixed(2)
                : 0;

            return {
                employeeId: employee._id,
                fullName: employee.fullName,
                email: employee.email,
                totalDays: totalDaysInMonth,
                presentDays,
                absentDays,
                unrecordedDays: totalDaysInMonth - totalRecordedDays,
                attendancePercentage: parseFloat(attendancePercentage)
            };
        });

        // Calculate overall statistics
        const totalEmployees = reportData.length;
        const avgAttendance = totalEmployees > 0
            ? (reportData.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / totalEmployees).toFixed(2)
            : 0;
        const totalPresentDays = reportData.reduce((sum, emp) => sum + emp.presentDays, 0);
        const totalAbsentDays = reportData.reduce((sum, emp) => sum + emp.absentDays, 0);

        res.status(200).json({
            month: monthNum,
            year: yearNum,
            totalWorkingDays: totalDaysInMonth,
            statistics: {
                totalEmployees,
                averageAttendance: parseFloat(avgAttendance),
                totalPresentDays,
                totalAbsentDays
            },
            employees: reportData
        });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ message: 'Server error while generating report' });
    }
};

module.exports = {
    getMonthlyReport
};
