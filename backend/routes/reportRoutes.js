const express = require('express');
const router = express.Router();
const { getMonthlyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Monthly report route - Admin only
router.get('/monthly', protect, authorize('admin'), getMonthlyReport);

module.exports = router;
