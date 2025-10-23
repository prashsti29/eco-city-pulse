// routes/wards.routes.js
const express = require('express');
const router = express.Router();
const livabilityService = require('../services/gee/livability.service');
const uriService = require('../services/gee/uri.service');

// City boundaries - add more cities as needed
const CITY_BOUNDS = {
  'Gurgaon': {
    north: 28.5000,
    south: 28.4000,
    east: 77.1000,
    west: 77.0000
  },
  'Bengaluru': {
    north: 13.0569,
    south: 12.8340,
    east: 77.7800,
    west: 77.4600
  },
  'Vadodara': {
    north: 22.3372,
    south: 22.2697,
    east: 73.2210,
    west: 73.1380
  }
};

router.get('/', async (req, res) => {
  try {
    const city = req.query.city || 'Gurgaon';
    const bounds = CITY_BOUNDS[city];

    if (!bounds) {
      return res.status(400).json({ error: 'City not found' });
    }

    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    
    // Divide city into grid (wards)
    const gridSize = 0.02; // ~2km cells
    const wardData = [];
    let wardNum = 1;

    for (let lat = bounds.south; lat < bounds.north; lat += gridSize) {
      for (let lng = bounds.west; lng < bounds.east; lng += gridSize) {
        const cellBounds = {
          north: Math.min(lat + gridSize, bounds.north),
          south: lat,
          east: Math.min(lng + gridSize, bounds.east),
          west: lng
        };

        try {
          // Calculate metrics for this ward
          const [livData, uriData] = await Promise.all([
            livabilityService.calculateGridLivability(cellBounds, startDate, endDate, gridSize),
            uriService.calculateURI(cellBounds, startDate, endDate)
          ]);

          if (livData.length > 0) {
            const cell = livData[0];
            wardData.push({
              name: `${city} Ward ${wardNum}`,
              liv: parseFloat((cell.livability * 100).toFixed(1)),
              uri: parseFloat((parseFloat(uriData.uri) * 100).toFixed(1)),
              vegetation: parseFloat((cell.metrics.ndvi * 100).toFixed(1)),
              heat: parseFloat(cell.metrics.lst.toFixed(1))
            });
            wardNum++;
          }
        } catch (err) {
          console.error(`Ward calculation failed:`, err.message);
        }

        if (wardData.length >= 10) break; // Limit to 10 wards
      }
      if (wardData.length >= 10) break;
    }

    // Create leaderboard
    const leaderboard = wardData
      .sort((a, b) => b.liv - a.liv)
      .map((ward, idx) => ({
        rank: idx + 1,
        ward: ward.name,
        score: ward.liv
      }));

    // Radar data for top ward
    const topWard = wardData[0] || { liv: 0, uri: 0, vegetation: 0, heat: 0 };
    const radarData = [
      { metric: "Livability", value: topWard.liv, fullMark: 100 },
      { metric: "Resilience", value: topWard.uri, fullMark: 100 },
      { metric: "Vegetation", value: topWard.vegetation, fullMark: 100 },
      { metric: "Heat Index", value: Math.max(0, 100 - topWard.heat), fullMark: 100 }
    ];

    res.json({
      wardData: wardData.slice(0, 3), // Top 3 for comparison tab
      leaderboard,
      radarData
    });

  } catch (error) {
    console.error('Wards endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;