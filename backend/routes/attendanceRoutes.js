const express = require('express');
const router = express.Router();
const {
    markAttendance,
    cleanLeaveConflicts,
    getMyAttendance,
    getAllAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Employee routes
router.post('/mark', protect, authorize('employee', 'admin'), markAttendance);
router.delete('/clean-leave-conflicts', protect, authorize('employee', 'admin'), cleanLeaveConflicts);
router.get('/my', protect, authorize('employee', 'admin'), getMyAttendance);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllAttendance);
router.put('/admin-update', protect, authorize('admin'), require('../controllers/attendanceController').adminUpdateAttendance);

module.exports = router;

