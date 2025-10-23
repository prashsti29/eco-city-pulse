const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { 
  getLivabilityData,
  getTopLivableAreas, 
  compareLocation,
  getFilteredHotspots,
  getLivabilityHeatmap
} = require('../controllers/livability.controller');

const router = express.Router();

// Public route for frontend
router.get('/analysis', getLivabilityData);

// Protected API routes
router.post('/top3', protect, getTopLivableAreas);
router.post('/compare', protect, compareLocation);
router.post('/hotspots', protect, getFilteredHotspots);
router.post('/heatmap', protect, getLivabilityHeatmap);

module.exports = router;