const { ee } = require('../../config/gee');
const ndviService = require('./ndvi.service');
const mndwiService = require('./mndwi.service');
const lstService = require('./lst.service');
const ndbiService = require('./ndbi.service');

// Generate tile URL for vegetation (green pixels)
exports.getVegetationTileUrl = async (bounds, startDate, endDate) => {
  const ndvi = ndviService.calculateNDVI(bounds, startDate, endDate);
  const vegetation = ndvi.gt(0.3); // Vegetation threshold

  const visParams = {
    min: 0,
    max: 1,
    palette: ['#000000', '#00FF00'] // Green for vegetation
  };

  return new Promise((resolve, reject) => {
    vegetation.getMap(visParams, (mapId, error) => {
      if (error) reject(error);
      else resolve(`https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`);
    });
  });
};

// Generate tile URL for water bodies (blue pixels)
exports.getWaterTileUrl = async (bounds, startDate, endDate) => {
  const mndwi = mndwiService.calculateMNDWI(bounds, startDate, endDate);
  const water = mndwi.gt(0.3); // Water threshold

  const visParams = {
    min: 0,
    max: 1,
    palette: ['#000000', '#0000FF'] // Blue for water
  };

  return new Promise((resolve, reject) => {
    water.getMap(visParams, (mapId, error) => {
      if (error) reject(error);
      else resolve(`https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`);
    });
  });
};

// Generate tile URL for heat hotspots (red pixels)
exports.getHeatHotspotTileUrl = async (bounds, startDate, endDate) => {
  const lst = lstService.calculateLST(bounds, startDate, endDate);
  const hotspots = lst.gt(35); // Temperature > 35°C

  const visParams = {
    min: 0,
    max: 1,
    palette: ['#000000', '#FF0000'] // Red for heat hotspots
  };

  return new Promise((resolve, reject) => {
    hotspots.getMap(visParams, (mapId, error) => {
      if (error) reject(error);
      else resolve(`https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`);
    });
  });
};

// Generate tile URL for encroached areas (yellow pixels)
// Encroachment = areas that lost NDVI (vegetation) and gained NDBI (built-up)
exports.getEncroachmentTileUrl = async (bounds, currentDate, pastDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  // Current NDVI and NDBI
  const currentNDVI = ndviService.calculateNDVI(bounds, currentDate.start, currentDate.end);
  const currentNDBI = ndbiService.calculateNDBI(bounds, currentDate.start, currentDate.end);

  // Past NDVI
  const pastNDVI = ndviService.calculateNDVI(bounds, pastDate.start, pastDate.end);

  // Detect encroachment: significant NDVI loss + NDBI gain
  const ndviLoss = pastNDVI.subtract(currentNDVI).gt(0.2); // Lost >0.2 NDVI
  const ndbiGain = currentNDBI.gt(0.1); // Gained built-up
  const encroachment = ndviLoss.and(ndbiGain);

  const visParams = {
    min: 0,
    max: 1,
    palette: ['#000000', '#FFFF00'] // Yellow for encroachment
  };

  return new Promise((resolve, reject) => {
    encroachment.getMap(visParams, (mapId, error) => {
      if (error) reject(error);
      else resolve(`https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`);
    });
  });
};

// Generate composite tile URL with all layers
exports.getCompositeTileUrl = async (bounds, startDate, endDate) => {
  const ndvi = ndviService.calculateNDVI(bounds, startDate, endDate);
  const mndwi = mndwiService.calculateMNDWI(bounds, startDate, endDate);
  const lst = lstService.calculateLST(bounds, startDate, endDate);

  const vegetation = ndvi.gt(0.3).multiply(1); // Green
  const water = mndwi.gt(0.3).multiply(2); // Blue
  const heat = lst.gt(35).multiply(3); // Red

  const composite = vegetation.add(water).add(heat);

  const visParams = {
    min: 0,
    max: 3,
    palette: ['#000000', '#00FF00', '#0000FF', '#FF0000']
  };

  return new Promise((resolve, reject) => {
    composite.getMap(visParams, (mapId, error) => {
      if (error) reject(error);
      else resolve(`https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`);
    });
  });
};
// Add to mapTiles.service.js
exports.getLivabilityHeatmapTileUrl = async (bounds, startDate, endDate) => {
  const livImage = await livabilityService.calculateLIVImage(bounds, startDate, endDate);
  
  const visParams = {
    min: 0,
    max: 1,
    palette: ['red', 'yellow', 'green'] // Low to high livability
  };
  
  return new Promise((resolve, reject) => {
    livImage.getMap(visParams, (mapId, error) => {
      if (error) reject(error);
      else resolve(`https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`);
    });
  });
};