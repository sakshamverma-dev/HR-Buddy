const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require('../models/Leave');

// Helper: local date string YYYY-MM-DD (timezone-safe)
const toLocalStr = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private (Employee)
const markAttendance = async (req, res) => {
    try {
        const { date, status } = req.body;

        if (!date || !status) {
            return res.status(400).json({ message: 'Please provide date and status' });
        }

        if (!['Present', 'Absent'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Parse dates
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only today's attendance can be marked
        if (attendanceDate.getTime() !== today.getTime()) {
            return res.status(400).json({ message: 'You can only mark attendance for today!' });
        }

        // Get user's joining date
        const user = await User.findById(req.user._id);
        const joiningDate = new Date(user.dateOfJoining);
        joiningDate.setHours(0, 0, 0, 0);

        if (today < joiningDate) {
            return res.status(400).json({
                message: `You cannot mark attendance before your joining date (${joiningDate.toLocaleDateString('en-GB')})`
            });
        }

        if (attendanceDate < joiningDate) {
            return res.status(400).json({ message: 'Cannot mark attendance before your joining date' });
        }

        // No attendance on Sundays
        if (attendanceDate.getDay() === 0) {
            return res.status(400).json({ message: 'Attendance cannot be marked on Sundays (weekly off)' });
        }

        // Check if today falls within an approved leave (timezone-safe comparison)
        const todayStr = toLocalStr(today);
        const approvedLeaves = await Leave.find({ userId: req.user._id, status: 'Approved' });
        const activeLeave = approvedLeaves.find(leave => {
            const s = toLocalStr(new Date(leave.startDate));
            const e = toLocalStr(new Date(leave.endDate));
            return todayStr >= s && todayStr <= e;
        });

        if (activeLeave) {
            // Delete any stale attendance record for today (cleanup if already marked before leave was approved)
            await Attendance.deleteMany({
                userId: req.user._id,
                date: { $gte: today, $lte: new Date(today.getTime() + 86399999) },
            });
            const endFormatted = new Date(activeLeave.endDate).toLocaleDateString('en-GB');
            return res.status(403).json({
                message: `You are on ${activeLeave.leaveType} leave till ${endFormatted}. You cannot mark attendance during this period.`,
                leaveInfo: activeLeave,
            });
        }

        // Check if attendance already marked
        const existingAttendance = await Attendance.findOne({
            userId: req.user._id,
            date: attendanceDate,
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'You have already marked your attendance for today.' });
        }

        const attendance = await Attendance.create({
            userId: req.user._id,
            date: attendanceDate,
            status,
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all attendance records that conflict with approved leave dates
// @route   DELETE /api/attendance/clean-leave-conflicts
// @access  Private (Employee)
const cleanLeaveConflicts = async (req, res) => {
    try {
        const approvedLeaves = await Leave.find({ userId: req.user._id, status: 'Approved' });

        let totalDeleted = 0;
        for (const leave of approvedLeaves) {
            const leaveStart = new Date(toLocalStr(new Date(leave.startDate)));
            leaveStart.setHours(0, 0, 0, 0);
            const leaveEnd = new Date(toLocalStr(new Date(leave.endDate)));
            leaveEnd.setHours(23, 59, 59, 999);

            const result = await Attendance.deleteMany({
                userId: req.user._id,
                date: { $gte: leaveStart, $lte: leaveEnd },
            });
            totalDeleted += result.deletedCount;
        }

        res.json({ message: `Cleaned up ${totalDeleted} conflicting attendance record(s)`, deletedCount: totalDeleted });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private (Employee)
const getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.user._id })
            .sort({ date: -1 })
            .populate('userId', 'fullName email');

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance (Admin)
// @route   GET /api/attendance/all
// @access  Private (Admin)
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .sort({ date: -1 })
            .populate('userId', 'fullName email');

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin update attendance
// @route   PUT /api/attendance/admin-update
// @access  Private (Admin)
const adminUpdateAttendance = async (req, res) => {
    try {
        const { userId, date, newStatus } = req.body;

        if (!userId || !date || !newStatus) {
            return res.status(400).json({ message: 'Please provide userId, date and newStatus' });
        }

        if (!['Present', 'Absent', 'Leave'].includes(newStatus)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Helper function to calculate totalDays for leave
        const calcDays = (start, end) => {
            let count = 0;
            let cur = new Date(start);
            while (cur <= end) {
                if (cur.getDay() !== 0) count++;
                cur.setDate(cur.getDate() + 1);
            }
            return count;
        };

        // Load user to update leave balance
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Handle overlapping leaves (split or delete them to make room for the override)
        const overlappingLeaves = await Leave.find({
            userId,
            status: { $in: ['Approved', 'Pending'] },
            startDate: { $lte: new Date(targetDate.getTime() + 86399999) },
            endDate: { $gte: targetDate }
        });

        for (const leave of overlappingLeaves) {
            // If the leave was approved, refund 1 day to the user's balance
            // (Assuming targetDate is not a Sunday, as Sundays are 0 days)
            if (leave.status === 'Approved' && targetDate.getDay() !== 0) {
                user.leaveBalance += 1;
            }

            const leaveStart = new Date(leave.startDate);
            leaveStart.setHours(0, 0, 0, 0);
            const leaveEnd = new Date(leave.endDate);
            leaveEnd.setHours(0, 0, 0, 0);

            if (leaveStart.getTime() === leaveEnd.getTime()) {
                await Leave.findByIdAndDelete(leave._id);
            } else if (targetDate.getTime() === leaveStart.getTime()) {
                const newStart = new Date(targetDate);
                newStart.setDate(newStart.getDate() + 1);
                leave.startDate = newStart;
                leave.totalDays = calcDays(newStart, leaveEnd);
                if (leave.totalDays > 0) await leave.save();
                else await Leave.findByIdAndDelete(leave._id);
            } else if (targetDate.getTime() === leaveEnd.getTime()) {
                const newEnd = new Date(targetDate);
                newEnd.setDate(newEnd.getDate() - 1);
                leave.endDate = newEnd;
                leave.totalDays = calcDays(leaveStart, newEnd);
                if (leave.totalDays > 0) await leave.save();
                else await Leave.findByIdAndDelete(leave._id);
            } else {
                // Target date is strictly in the middle, we must split the leave
                const firstEnd = new Date(targetDate);
                firstEnd.setDate(firstEnd.getDate() - 1);
                
                const secondStart = new Date(targetDate);
                secondStart.setDate(secondStart.getDate() + 1);

                leave.endDate = firstEnd;
                leave.totalDays = calcDays(leaveStart, firstEnd);
                await leave.save();

                await Leave.create({
                    userId: leave.userId,
                    leaveType: leave.leaveType,
                    status: leave.status,
                    reason: leave.reason + ' (Split by Admin)',
                    startDate: secondStart,
                    endDate: leaveEnd,
                    totalDays: calcDays(secondStart, leaveEnd),
                    appliedDate: leave.appliedDate
                });
            }
        }

        // 2. Handle the new status
        if (newStatus === 'Leave') {
            await Attendance.deleteMany({
                userId,
                date: { $gte: targetDate, $lte: new Date(targetDate.getTime() + 86399999) }
            });

            if (targetDate.getDay() !== 0) {
                await Leave.create({
                    userId,
                    leaveType: 'Casual',
                    status: 'Approved',
                    reason: 'Admin Override',
                    startDate: targetDate,
                    endDate: targetDate,
                    totalDays: 1,
                });
                // Deduct 1 day for creating a new Approved leave
                user.leaveBalance -= 1;
            }
            
            await user.save();
            return res.json({ message: 'Successfully marked as On Leave' });
        } else {
            const existingAttendance = await Attendance.findOne({
                userId,
                date: { $gte: targetDate, $lte: new Date(targetDate.getTime() + 86399999) }
            });

            if (existingAttendance) {
                existingAttendance.status = newStatus;
                await existingAttendance.save();
            } else {
                await Attendance.create({
                    userId,
                    date: targetDate,
                    status: newStatus
                });
            }
            
            await user.save();
            return res.json({ message: `Successfully marked as ${newStatus}` });
        }
    } catch (error) {
        console.error('Admin Update Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    cleanLeaveConflicts,
    getMyAttendance,
    getAllAttendance,
    adminUpdateAttendance,
};
