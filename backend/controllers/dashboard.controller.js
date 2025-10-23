const ndviService = require('../services/gee/ndvi.service');
const lstService = require('../services/gee/lst.service');
const mndwiService = require('../services/gee/mndwi.service');
const ndbiService = require('../services/gee/ndbi.service');
const heatVulnerabilityService = require('../services/gee/heatVulnerability.service');

async function getDashboardData(req, res) {
  try {
    console.log('📊 Fetching dashboard data...');
    
    const bounds = {
      north: 22.3372,
      south: 22.2671,
      east: 73.2310,
      west: 73.1409
    };
    
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';

    const [ndviStats, avgTemp, waterArea, builtUpPercent, heatVuln] = await Promise.all([
      ndviService.getNDVIStats(bounds, startDate, endDate),
      lstService.getAverageTemperature(bounds, startDate, endDate),
      mndwiService.getWaterBodyArea(bounds, startDate, endDate),
      ndbiService.getBuiltUpPercentage(bounds, startDate, endDate),
      heatVulnerabilityService.getHeatVulnerabilityStats(bounds, startDate, endDate)
    ]);

    const greenCover = await ndviService.getGreenCoverPercentage(bounds, startDate, endDate);
    
    // Calculate livability score (0-100 scale)
    const livabilityScore = (
      parseFloat(ndviStats.NDVI_mean) * 40 +
      (1 - parseFloat(builtUpPercent) / 100) * 30 +
      (40 - Math.min(parseFloat(avgTemp), 40)) * 0.75
    ).toFixed(1);

    const response = {
      metrics: [
        {
          label: "Livability Score",
          value: livabilityScore,
          unit: "%",
          trend: "+2.3%"
        },
        {
          label: "Green Coverage (NDVI)",
          value: greenCover,
          unit: "%",
          trend: "+1.2%"
        },
        {
          label: "Water Quality (MNDWI)",
          value: (parseFloat(waterArea) * 10).toFixed(1),
          unit: "%",
          trend: "-0.5%"
        },
        {
          label: "Avg Temperature (LST)",
          value: avgTemp,
          unit: "°C",
          trend: "+0.8°C"
        },
        {
          label: "Heat Vulnerability Index",
          value: (parseFloat(heatVuln.hvi) * 100).toFixed(1),
          unit: "%",
          trend: "+1.1%"
        }
      ],
      breakdown: [
        { label: "NDVI", value: `${greenCover}%` },
        { label: "MNDWI", value: `${(parseFloat(waterArea) * 10).toFixed(1)}%` },
        { label: "LST", value: `${avgTemp}°C` },
        { label: "NDBI", value: `${builtUpPercent}%` }
      ],
      charts: {
        comparison: [
          { name: "NDVI", value: parseFloat(greenCover) },
          { name: "NDBI", value: parseFloat(builtUpPercent) }
        ],
        waterQuality: [
          { name: "Quality", value: parseFloat(waterArea) * 10 },
          { name: "Target", value: 70 }
        ]
      }
    };

    console.log('✅ Dashboard data sent');
    res.json(response);

  } catch (err) {
    console.error('❌ Dashboard error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: err.message 
    });
  }
}

module.exports = { getDashboardData };