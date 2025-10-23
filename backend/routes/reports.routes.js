const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getReportAnalytics
} = require('../controllers/reports.controller');

const router = express.Router();

router.post('/', protect, createReport);
router.get('/', protect, getReports);
router.get('/:id', protect, getReportById);
router.patch('/:id/status', protect, authorize('official'), updateReportStatus);
router.delete('/:id', protect, deleteReport);
router.post('/analytics', protect, getReportAnalytics);

module.exports = router;