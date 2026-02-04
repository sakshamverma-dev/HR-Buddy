const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    editLeave,
    cancelLeave,
    getAllLeaves,
    updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Employee routes
router.post('/apply', protect, authorize('employee', 'admin'), applyLeave);
router.get('/my', protect, authorize('employee', 'admin'), getMyLeaves);
router.put('/edit/:id', protect, authorize('employee', 'admin'), editLeave);
router.delete('/cancel/:id', protect, authorize('employee', 'admin'), cancelLeave);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllLeaves);
router.put('/status/:id', protect, authorize('admin'), updateLeaveStatus);

module.exports = router;
