const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Auto-mark absent for employees who didn't mark attendance
const autoMarkAbsent = async () => {
    try {
        console.log('Running auto-absent cron job...');

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all employees (not admins)
        const employees = await User.find({ role: 'employee' });

        for (const employee of employees) {
            // Check if employee's joining date is before or equal to today
            const joiningDate = new Date(employee.dateOfJoining);
            joiningDate.setHours(0, 0, 0, 0);

            if (joiningDate > today) {
                // Skip employees who haven't joined yet
                continue;
            }

            // Check if attendance already marked for today
            const existingAttendance = await Attendance.findOne({
                userId: employee._id,
                date: today,
            });

            // If not marked, create absent record
            if (!existingAttendance) {
                await Attendance.create({
                    userId: employee._id,
                    date: today,
                    status: 'Absent',
                });
                console.log(`Auto-marked absent: ${employee.fullName} (${employee.email})`);
            }
        }

        console.log('Auto-absent cron job completed successfully');
    } catch (error) {
        console.error('Error in auto-absent cron job:', error.message);
    }
};

// Schedule cron job to run every day at 11:59 PM
const scheduleAutoAbsent = () => {
    // Cron format: second minute hour day month weekday
    // '59 23 * * *' = Every day at 11:59 PM
    cron.schedule('59 23 * * *', autoMarkAbsent, {
        timezone: 'Asia/Kolkata', // Indian timezone
    });

    console.log('Auto-absent cron job scheduled: Runs daily at 11:59 PM IST');
};

// For testing: Run immediately (comment out in production)
const runAutoAbsentNow = async () => {
    console.log('Running auto-absent manually for testing...');
    await autoMarkAbsent();
};

module.exports = {
    scheduleAutoAbsent,
    runAutoAbsentNow,
};
