const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getInsightsDashboard } = require('../controllers/gee.controller');

const router = express.Router();

router.post('/insights', protect, getInsightsDashboard);

module.exports = router;