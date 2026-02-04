const Leave = require('../models/Leave');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

// Calculate days between two dates (excluding Sundays)
const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let count = 0;
    let currentDate = new Date(start);

    // Loop through each day from start to end
    while (currentDate <= end) {
        // Only count if not Sunday (day 0)
        if (currentDate.getDay() !== 0) {
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
};

// @desc    Apply for leave
// @route   POST /api/leave/apply
// @access  Private (Employee)
const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // Validation
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Get user's joining date and leave balance
        const user = await User.findById(req.user._id);
        const joiningDate = new Date(user.dateOfJoining);
        joiningDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if today is before joining date
        if (today < joiningDate) {
            return res.status(400).json({
                message: `You cannot apply for leave before your joining date (${joiningDate.toLocaleDateString('en-GB')})`
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Check if dates fall on Sunday (day 0)
        if (start.getDay() === 0 || end.getDay() === 0) {
            return res.status(400).json({
                message: 'Sundays are holidays! Please select working days only.'
            });
        }

        // Check for overlapping leave dates
        const existingLeaves = await Leave.find({
            userId: req.user._id,
            status: { $in: ['Pending', 'Approved'] }, // Only check pending and approved leaves
            $or: [
                // New leave starts during existing leave
                { startDate: { $lte: end }, endDate: { $gte: start } },
                // New leave ends during existing leave
                { startDate: { $lte: end }, endDate: { $gte: start } },
                // New leave completely covers existing leave
                { startDate: { $gte: start }, endDate: { $lte: end } }
            ]
        });

        if (existingLeaves.length > 0) {
            const conflictDates = existingLeaves.map(leave =>
                `${new Date(leave.startDate).toLocaleDateString('en-GB')} to ${new Date(leave.endDate).toLocaleDateString('en-GB')}`
            ).join(', ');

            return res.status(400).json({
                message: `Leave already applied for overlapping dates: ${conflictDates}`
            });
        }

        // Calculate total days
        const totalDays = calculateDays(startDate, endDate);

        // Check leave balance (reuse user variable from above)
        if (user.leaveBalance < totalDays) {
            return res.status(400).json({
                message: `Insufficient leave balance. You have ${user.leaveBalance} days remaining`
            });
        }

        // Create leave request
        const leave = await Leave.create({
            userId: req.user._id,
            leaveType,
            startDate,
            endDate,
            totalDays,
            reason,
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my leave requests
// @route   GET /api/leave/my
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.user._id })
            .sort({ appliedDate: -1 })
            .populate('userId', 'fullName email');

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Edit leave request
// @route   PUT /api/leave/edit/:id
// @access  Private (Employee)
const editLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Check if leave belongs to user
        if (leave.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this leave request' });
        }

        // Check if leave is still pending
        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only edit pending leave requests' });
        }

        const { leaveType, startDate, endDate, reason } = req.body;

        // Update fields
        if (leaveType) leave.leaveType = leaveType;
        if (reason) leave.reason = reason;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (end < start) {
                return res.status(400).json({ message: 'End date must be after start date' });
            }

            // Check if dates fall on Sunday (day 0)
            if (start.getDay() === 0 || end.getDay() === 0) {
                return res.status(400).json({
                    message: 'Sundays are holidays! Please select working days only.'
                });
            }

            leave.startDate = startDate;
            leave.endDate = endDate;
            leave.totalDays = calculateDays(startDate, endDate);
        }

        const updatedLeave = await leave.save();
        res.json(updatedLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel leave request
// @route   DELETE /api/leave/cancel/:id
// @access  Private (Employee)
const cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Check if leave belongs to user
        if (leave.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this leave request' });
        }

        // Check if leave is still pending
        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only cancel pending leave requests' });
        }

        await leave.deleteOne();
        res.json({ message: 'Leave request cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all leave requests (Admin)
// @route   GET /api/leave/all
// @access  Private (Admin)
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .sort({ appliedDate: -1 })
            .populate('userId', 'fullName email');

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status (Admin)
// @route   PUT /api/leave/status/:id
// @access  Private (Admin)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Leave request already processed' });
        }

        leave.status = status;
        const updatedLeave = await leave.save();

        // Update user leave balance if approved
        let user;
        if (status === 'Approved') {
            user = await User.findById(leave.userId);
            user.leaveBalance -= leave.totalDays;
            await user.save();
        } else {
            // Fetch user for email even if rejected
            user = await User.findById(leave.userId);
        }

        // Send Email Notification
        if (user && user.email) {
            const subject = `Leave Request ${status}`;
            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: ${status === 'Approved' ? '#2e7d32' : '#c62828'};">
                        Leave Request ${status}
                    </h2>
                    <p>Dear ${user.fullName},</p>
                    <p>Your leave request has been <strong>${status}</strong>.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Leave Type:</strong> ${leave.leaveType}</p>
                        <p><strong>From:</strong> ${new Date(leave.startDate).toLocaleDateString('en-GB')}</p>
                        <p><strong>To:</strong> ${new Date(leave.endDate).toLocaleDateString('en-GB')}</p>
                        <p><strong>Total Days:</strong> ${leave.totalDays}</p>
                    </div>

                    ${status === 'Rejected' ? '<p>Please contact HR for more details.</p>' : '<p>Enjoy your leave!</p>'}
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #777;">
                        This is an automated message from HR Buddy.
                    </p>
                </div>
            `;

            // Send email asynchronously without blocking response
            sendEmail(user.email, subject, message).catch(err =>
                console.error('Failed to send email:', err)
            );
        }

        res.json(updatedLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    editLeave,
    cancelLeave,
    getAllLeaves,
    updateLeaveStatus,
};
