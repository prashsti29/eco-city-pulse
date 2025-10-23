const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const timelineService = require('../services/gee/timeline.service');

const router = express.Router();

const { getTimelineData } = require('../controllers/timeline.controller');
router.get('/', protect, getTimelineData);

module.exports = router;