const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

/**
 * Helper: Get local date string YYYY-MM-DD without UTC conversion
 * Avoids timezone offset issues (e.g. IST midnight = previous day in UTC)
 */
const toLocalDateString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Auto-fill missing attendance from joining date to yesterday as Absent
 * Skips Sundays (weekly off)
 * This runs when user logs in or signs up
 */
const autoFillMissingAttendance = async (user) => {
    try {
        // Get user's joining date (normalized to midnight local time)
        const joiningDate = new Date(user.dateOfJoining);
        joiningDate.setHours(0, 0, 0, 0);

        // Get today's date (midnight local time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If joining date is today or in future, no need to fill
        if (joiningDate >= today) {
            return;
        }

        // Get all existing attendance records for this user
        const existingAttendance = await Attendance.find({ userId: user._id });
        const existingDates = new Set(
            existingAttendance.map(record => toLocalDateString(new Date(record.date)))
        );

        // Get all approved leaves for this user to skip those dates
        const approvedLeaves = await Leave.find({
            userId: user._id,
            status: 'Approved',
        });

        const leaveDates = new Set();
        approvedLeaves.forEach(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            let cur = new Date(start);
            while (cur <= end) {
                if (cur.getDay() !== 0) { // skip Sundays
                    leaveDates.add(toLocalDateString(cur));
                }
                cur.setDate(cur.getDate() + 1);
            }
        });

        // Get pending leaves — their FUTURE/TODAY dates are skipped from auto-fill
        // (leave might still be approved). Their PAST dates will be filled as Absent
        // (leave decision never came).
        const pendingLeaves = await Leave.find({ userId: user._id, status: 'Pending' });
        const pendingFutureDates = new Set(); // today + future pending dates — skip entirely
        pendingLeaves.forEach(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            let cur = new Date(start);
            while (cur <= end) {
                if (cur.getDay() !== 0) {
                    const dk = toLocalDateString(cur);
                    // Only skip TODAY and FUTURE pending dates
                    if (dk >= toLocalDateString(today)) {
                        pendingFutureDates.add(dk);
                    }
                    // Past pending dates → will be auto-filled as Absent below
                }
                cur.setDate(cur.getDate() + 1);
            }
        });

        // Cleanup: delete attendance that conflicts with approved leaves
        if (leaveDates.size > 0) {
            for (const dk of leaveDates) {
                const dayStart = new Date(dk);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dk);
                dayEnd.setHours(23, 59, 59, 999);
                await Attendance.deleteMany({
                    userId: user._id,
                    date: { $gte: dayStart, $lte: dayEnd },
                });
            }
            // Refresh existing dates after cleanup
            const refreshed = await Attendance.find({ userId: user._id });
            existingDates.clear();
            refreshed.forEach(r => existingDates.add(toLocalDateString(new Date(r.date))));
        }

        // Find all missing dates from joining date to yesterday
        // Skip: Sundays, approved leave days, today/future pending leave days
        // Fill as Absent: missing non-leave days + past pending leave days
        const missingDates = [];
        let currentDate = new Date(joiningDate);

        while (currentDate < today) {
            const isSunday = currentDate.getDay() === 0;

            if (!isSunday) {
                const dateString = toLocalDateString(currentDate);
                const isApprovedLeave = leaveDates.has(dateString);
                const isPendingFuture = pendingFutureDates.has(dateString);

                // Skip: already has record, approved leave day, or future pending date
                if (!existingDates.has(dateString) && !isApprovedLeave && !isPendingFuture) {
                    missingDates.push(new Date(currentDate));
                }
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

module.exports = { autoFillMissingAttendance, toLocalDateString };
