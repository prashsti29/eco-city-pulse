const ndviService = require('../services/gee/ndvi.service');
const lstService = require('../services/gee/lst.service');
const mndwiService = require('../services/gee/mndwi.service');
const ndbiService = require('../services/gee/ndbi.service');
const livabilityService = require('../services/gee/livability.service');
const uriService = require('../services/gee/uri.service');

async function getOverviewData(req, res) {
  try {
    console.log('📊 Fetching overview data...');
    
    // Default bounds (Vadodara) - adjust as needed
    const bounds = {
      north: 22.3372,
      south: 22.2671,
      east: 73.2310,
      west: 73.1409
    };
    
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';

    // Fetch all metrics in parallel
    const [greenCover, avgTemp, gridLivability, uriData] = await Promise.all([
      ndviService.getGreenCoverPercentage(bounds, startDate, endDate),
      lstService.getAverageTemperature(bounds, startDate, endDate),
      livabilityService.calculateGridLivability(bounds, startDate, endDate, 0.05),
      uriService.calculateURI(bounds, startDate, endDate)
    ]);

    // Calculate average LIV from grid
    const avgLIV = gridLivability.length > 0
      ? gridLivability.reduce((sum, cell) => sum + cell.livability, 0) / gridLivability.length
      : 0;

    // Get top 5 areas by livability
    const topAreas = gridLivability
      .sort((a, b) => b.livability - a.livability)
      .slice(0, 5)
      .map((area, idx) => ({
        area: `Zone ${idx + 1}`,
        liv: parseFloat((area.livability * 100).toFixed(2)),
        uri: parseFloat((uriData.uri * 100 * (1 - idx * 0.05)).toFixed(2)) // Approximate URI per zone
      }));

    const response = {
      metrics: [
        {
          label: 'Average Livability',
          value: (avgLIV * 100).toFixed(2),
          unit: 'LIV',
          color: 'bg-green-500/10'
        },
        {
          label: 'Average Resilience',
          value: (parseFloat(uriData.uri) * 100).toFixed(2),
          unit: 'URI',
          color: 'bg-blue-500/10'
        },
        {
          label: 'Vegetation Cover',
          value: parseFloat(greenCover).toFixed(1),
          unit: '%',
          color: 'bg-emerald-500/10'
        },
        {
          label: 'Average Temperature',
          value: parseFloat(avgTemp).toFixed(1),
          unit: '°C',
          color: 'bg-orange-500/10'
        }
      ],
      summary: topAreas,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Overview data sent');
    res.json(response);

  } catch (err) {
    console.error('❌ Overview error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch overview data',
      details: err.message 
    });
  }
}

module.exports = { getOverviewData };