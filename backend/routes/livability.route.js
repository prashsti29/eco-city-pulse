const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { 
  getTopLivableAreas, 
  compareLocation,
  getFilteredHotspots,      // ADD THIS
  getLivabilityHeatmap       // ADD THIS
} = require('../controllers/livability.controller');

const router = express.Router();

router.post('/top3', protect, getTopLivableAreas);
router.post('/compare', protect, compareLocation);
router.post('/hotspots', protect, getFilteredHotspots);
router.post('/heatmap', protect, getLivabilityHeatmap);

module.exports = router;