const ndviService = require('../services/gee/ndvi.service');
const mndwiService = require('../services/gee/mndwi.service');
const lstService = require('../services/gee/lst.service');
const ndbiService = require('../services/gee/ndbi.service');
const hviService = require('../services/gee/heatVulnerability.service');
const mapTilesService = require('../services/gee/mapTiles.service');

exports.getInsightsDashboard = async (req, res) => {
  console.log('Insights called with:', req.body);
  try {
    const { bounds, startDate, endDate } = req.body;

    if (!bounds || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'bounds, startDate, endDate required' 
      });
    }

    // Validate bounds
    if (!bounds.north || !bounds.south || !bounds.east || !bounds.west) {
      return res.status(400).json({
        success: false,
        message: 'bounds must include north, south, east, west coordinates'
      });
    }

    // Calculate all metrics in parallel
    const [
      greenCover,
      waterArea,
      avgTemp,
      ndviStats,
      ndbiStats,
      heatVulnerability,
      vegetationTileUrl,
      waterTileUrl,
      heatTileUrl
    ] = await Promise.all([
      ndviService.getGreenCoverPercentage(bounds, startDate, endDate),
      mndwiService.getWaterBodyArea(bounds, startDate, endDate),
      lstService.getAverageTemperature(bounds, startDate, endDate),
      ndviService.getNDVIStats(bounds, startDate, endDate),
      ndbiService.getNDBIStats(bounds, startDate, endDate),
      hviService.getHeatVulnerabilityStats(bounds, startDate, endDate),
      mapTilesService.getVegetationTileUrl(bounds, startDate, endDate),
      mapTilesService.getWaterTileUrl(bounds, startDate, endDate),
      mapTilesService.getHeatHotspotTileUrl(bounds, startDate, endDate)
    ]);

    // Get encroachment tile (compare with 5 years ago)
    const pastYear = new Date(startDate);
    pastYear.setFullYear(pastYear.getFullYear() - 5);
    const pastStartDate = pastYear.toISOString().split('T')[0];
    const pastEndDate = new Date(endDate);
    pastEndDate.setFullYear(pastEndDate.getFullYear() - 5);
    const pastEnd = pastEndDate.toISOString().split('T')[0];

    const encroachmentTileUrl = await mapTilesService.getEncroachmentTileUrl(
      bounds,
      { start: startDate, end: endDate },
      { start: pastStartDate, end: pastEnd }
    );

    res.json({
      success: true,
      data: {
        // Statistics
        greenCoverPercent: greenCover,
        waterBodyAreaKm2: waterArea,
        averageTemperature: avgTemp,
        
        // Indices
        ndvi: ndviStats.NDVI_mean?.toFixed(3),
        mndwi: waterArea, // Already calculated
        ndbi: ndbiStats.NDBI_mean?.toFixed(3),
        
        // Heat Vulnerability
        heatVulnerabilityIndex: heatVulnerability.hvi,
        vulnerabilityLevel: heatVulnerability.level,
        
        // Map Tile URLs for visualization
        mapLayers: {
          vegetation: vegetationTileUrl,      // Green pixels
          waterBodies: waterTileUrl,          // Blue pixels
          heatHotspots: heatTileUrl,          // Red pixels
          encroachment: encroachmentTileUrl   // Yellow pixels
        }
      }
    });
  } catch (error) {
    console.error('Insights Dashboard Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};