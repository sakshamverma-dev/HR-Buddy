// Run this script once to update existing employees with default jobRole
// Usage: node updateExistingEmployees.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateExistingEmployees = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        // Find all employees without jobRole
        const employeesWithoutJobRole = await User.find({
            role: 'employee',
            $or: [
                { jobRole: { $exists: false } },
                { jobRole: null },
                { jobRole: '' }
            ]
        });

        console.log(`Found ${employeesWithoutJobRole.length} employees without job role`);

        // Update each employee
        for (const employee of employeesWithoutJobRole) {
            employee.jobRole = 'Not Specified';
            await employee.save();
            console.log(`Updated: ${employee.fullName} (${employee.email})`);
        }

        console.log('\n✅ All existing employees updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

updateExistingEmployees();
