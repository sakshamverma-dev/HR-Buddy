const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getMyAttendance,
    getAllAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Employee routes
router.post('/mark', protect, authorize('employee', 'admin'), markAttendance);
router.get('/my', protect, authorize('employee', 'admin'), getMyAttendance);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllAttendance);

module.exports = router;
