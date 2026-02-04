const Attendance = require('../models/Attendance');

/**
 * Auto-fill missing attendance from joining date to yesterday as Absent
 * This runs when user logs in or signs up
 */
const autoFillMissingAttendance = async (user) => {
    try {
        // Get user's joining date
        const joiningDate = new Date(user.dateOfJoining);
        joiningDate.setHours(0, 0, 0, 0);

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If joining date is today or in future, no need to fill
        if (joiningDate >= today) {
            return;
        }

        // Get all existing attendance records for this user
        const existingAttendance = await Attendance.find({ userId: user._id });
        const existingDates = new Set(
            existingAttendance.map(record =>
                new Date(record.date).toISOString().split('T')[0]
            )
        );

        // Find all missing dates from joining date to yesterday
        const missingDates = [];
        let currentDate = new Date(joiningDate);

        while (currentDate < today) {
            const dateString = currentDate.toISOString().split('T')[0];

            // If this date doesn't have attendance record, add to missing
            if (!existingDates.has(dateString)) {
                missingDates.push(new Date(currentDate));
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create absent records for all missing dates
        if (missingDates.length > 0) {
            await Attendance.insertMany(
                missingDates.map(date => ({
                    userId: user._id,
                    date: date,
                    status: 'Absent',
                }))
            );
            console.log(`✅ Auto-filled ${missingDates.length} absent days for ${user.fullName} (${user.email})`);
        }
    } catch (error) {
        console.error('Error in autoFillMissingAttendance:', error.message);
    }
};

module.exports = { autoFillMissingAttendance };
