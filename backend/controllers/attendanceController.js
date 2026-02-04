const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private (Employee)
const markAttendance = async (req, res) => {
    try {
        const { date, status } = req.body;

        // Validation
        if (!date || !status) {
            return res.status(400).json({ message: 'Please provide date and status' });
        }

        if (!['Present', 'Absent'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Check if date is today only
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Validate: Only today's attendance can be marked
        if (attendanceDate.getTime() !== today.getTime()) {
            return res.status(400).json({
                message: 'You can only mark attendance for today!'
            });
        }

        // Get user's joining date
        const user = await User.findById(req.user._id);
        const joiningDate = new Date(user.dateOfJoining);
        joiningDate.setHours(0, 0, 0, 0);

        // Check if today is before joining date
        if (today < joiningDate) {
            return res.status(400).json({
                message: `You cannot mark attendance before your joining date (${joiningDate.toLocaleDateString('en-GB')})`
            });
        }

        // Check if trying to mark attendance before joining date
        if (attendanceDate < joiningDate) {
            return res.status(400).json({
                message: 'Cannot mark attendance before your joining date'
            });
        }

        // Check if attendance already marked for this date
        const existingAttendance = await Attendance.findOne({
            userId: req.user._id,
            date: attendanceDate,
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for this date' });
        }

        // Create attendance record for today
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

module.exports = {
    markAttendance,
    getMyAttendance,
    getAllAttendance,
};
