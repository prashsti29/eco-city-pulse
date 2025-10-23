const livabilityService = require('../services/gee/livability.service');

exports.getTopLivableAreas = async (req, res) => {
  try {
    const { bounds, startDate, endDate, filter } = req.body;

    if (!bounds || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'bounds, startDate, endDate required'
      });
    }

    const validFilters = ['overall', 'coolest', 'greenest', 'water'];
    const selectedFilter = validFilters.includes(filter) ? filter : 'overall';

    const top3 = await livabilityService.getTop3Livable(
      bounds,
      startDate,
      endDate,
      selectedFilter
    );

    res.json({
      success: true,
      filter: selectedFilter,
      data: top3
    });
  } catch (error) {
    console.error('Top Livable Areas Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.compareLocation = async (req, res) => {
  try {
    const { userBounds, topAreaBounds, startDate, endDate } = req.body;

    if (!userBounds || !topAreaBounds || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'userBounds, topAreaBounds, startDate, endDate required'
      });
    }

    const comparison = await livabilityService.compareWithLocation(
      userBounds,
      topAreaBounds,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Location Comparison Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFilteredHotspots = async (req, res) => {
  try {
    const { bounds, startDate, endDate, filters } = req.body;

    if (!bounds || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'bounds, startDate, endDate required'
      });
    }

    let filter = 'overall';
    if (filters && filters.includes('greenery')) filter = 'greenest';
    else if (filters && filters.includes('water')) filter = 'water';
    else if (filters && filters.includes('temperature')) filter = 'coolest';

    const results = await livabilityService.getTop3Livable(bounds, startDate, endDate, filter);
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Filtered Hotspots Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLivabilityHeatmap = async (req, res) => {
  try {
    const { bounds, startDate, endDate } = req.body;

    if (!bounds || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'bounds, startDate, endDate required'
      });
    }

    const mapTilesService = require('../services/gee/mapTiles.service');
    const tileUrl = await mapTilesService.getVegetationTileUrl(bounds, startDate, endDate);

    res.json({
      success: true,
      data: { tileUrl, type: 'livability_heatmap' }
    });
  } catch (error) {
    console.error('Livability Heatmap Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTopLivableAreas: exports.getTopLivableAreas,
  compareLocation: exports.compareLocation,
  getFilteredHotspots: exports.getFilteredHotspots,
  getLivabilityHeatmap: exports.getLivabilityHeatmap
};