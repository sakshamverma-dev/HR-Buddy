const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { autoFillMissingAttendance } = require('../utils/attendanceHelper');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { fullName, email, password, dateOfJoining, jobRole } = req.body;

        // Validation
        if (!fullName || !email || !password || !dateOfJoining || !jobRole) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
            dateOfJoining,
            jobRole,
            role: 'employee', // Default role
        });

        if (user) {
            // Auto-fill missing attendance from joining date
            if (user.role === 'employee') {
                autoFillMissingAttendance(user).catch(err =>
                    console.error('Auto-fill attendance error:', err)
                );
            }

            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                jobRole: user.jobRole,
                dateOfJoining: user.dateOfJoining,
                leaveBalance: user.leaveBalance,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            // Auto-fill missing attendance from joining date
            if (user.role === 'employee') {
                autoFillMissingAttendance(user).catch(err =>
                    console.error('Auto-fill attendance error:', err)
                );
            }

            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                jobRole: user.jobRole,
                dateOfJoining: user.dateOfJoining,
                leaveBalance: user.leaveBalance,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            jobRole: user.jobRole,
            dateOfJoining: user.dateOfJoining,
            leaveBalance: user.leaveBalance,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
