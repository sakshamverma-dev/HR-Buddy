const express = require('express');
const router = express.Router();
const { runAutoAbsentNow } = require('../config/cronJobs');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @desc    Manually trigger auto-absent (for testing)
// @route   POST /api/cron/auto-absent
// @access  Private (Admin only)
router.post('/auto-absent', protect, authorize('admin'), async (req, res) => {
    try {
        await runAutoAbsentNow();
        res.json({ message: 'Auto-absent job executed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
