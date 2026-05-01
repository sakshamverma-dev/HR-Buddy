require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { scheduleAutoAbsent } = require('./config/cronJobs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const cronRoutes = require('./routes/cronRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Initialize app
const app = express();

// Start cron jobs (only runs locally, Vercel uses vercel.json cron or manual trigger)
if (process.env.NODE_ENV !== 'production') {
    scheduleAutoAbsent();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serverless DB Connection Middleware
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'HR System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Start server locally
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        await connectDB();
        seedAdmin().catch(err => console.error('Seed Admin Access Error:', err));
    });
} else {
    // For Vercel production, we don't call app.listen()
    // but we can seed admin lazily if we wanted.
    // seedAdmin().catch(() => {});
}

module.exports = app;

// Admin seed function (automatically creates admin user from .env credentials)
const seedAdmin = async () => {
    try {
        const User = require('./models/User');

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                fullName: process.env.ADMIN_NAME,
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin',
                dateOfJoining: new Date(),
                leaveBalance: 0,
            });
            console.log(`Admin user created: ${adminEmail} / ${process.env.ADMIN_PASSWORD}`);
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Seed Admin Error:', error.message);
    }
};
