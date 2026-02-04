const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Please provide full name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please provide password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['employee', 'admin'],
            default: 'employee',
        },
        jobRole: {
            type: String,
            required: function () {
                return this.role === 'employee';
            },
            trim: true,
        },
        dateOfJoining: {
            type: Date,
            required: [true, 'Please provide date of joining'],
        },
        leaveBalance: {
            type: Number,
            default: 20,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
