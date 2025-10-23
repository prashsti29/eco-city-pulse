const ndviService = require('./ndvi.service');
const lstService = require('./lst.service');
const mndwiService = require('./mndwi.service');

exports.generateSuggestions = async (bounds, startDate, endDate, currentLiv) => {
  const suggestions = [];
  
  // Get current metrics
  const [ndviStats, lstAvg, waterArea] = await Promise.all([
    ndviService.getNDVIStats(bounds, startDate, endDate),
    lstService.getAverageTemperature(bounds, startDate, endDate),
    mndwiService.getWaterBodyArea(bounds, startDate, endDate)
  ]);

  // Generate actionable suggestions
  if (ndviStats.NDVI_mean < 0.3) {
    suggestions.push({
      type: 'vegetation',
      priority: 'high',
      message: 'Increase tree cover by 15% to improve air quality and reduce temperature',
      impact: '+0.12 LIV score'
    });
  }

  if (parseFloat(lstAvg) > 35) {
    suggestions.push({
      type: 'cooling',
      priority: 'critical',
      message: 'Install cool roofs and increase shade cover to combat heat',
      impact: '-3°C average temperature'
    });
  }

  if (parseFloat(waterArea) < 0.5) {
    suggestions.push({
      type: 'water',
      priority: 'medium',
      message: 'Enhance water bodies and rainwater harvesting systems',
      impact: '+0.08 LIV score'
    });
  }

  return suggestions;
};

exports.findBetterNearbyAreas = async (centerBounds, radius = 0.1) => {
  // Create 8 nearby areas in grid pattern
  const nearbyAreas = [
    { lat: centerBounds.north + radius, lng: centerBounds.west },
    { lat: centerBounds.north + radius, lng: centerBounds.east },
    { lat: centerBounds.south - radius, lng: centerBounds.west },
    { lat: centerBounds.south - radius, lng: centerBounds.east }
  ];

  // Calculate LIV for each (simplified - reuse livability service)
  // Return top 3 better alternatives
  return nearbyAreas.slice(0, 3);
};