const { ee } = require('../../config/gee');

// Calculate NDBI (Normalized Difference Built-up Index)
exports.calculateNDBI = (bounds, startDate, endDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  const s2 = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

  const ndbi = s2.map(img => {
    return img.normalizedDifference(['B11', 'B8']).rename('NDBI');
  }).mean();

  return ndbi.clip(geometry);
};

exports.getNDBIStats = async (bounds, startDate, endDate) => {
  const ndbi = exports.calculateNDBI(bounds, startDate, endDate);
  
  const stats = ndbi.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]),
    scale: 10,
    maxPixels: 1e9
  });

  return new Promise((resolve, reject) => {
    stats.evaluate((result, error) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

exports.getBuiltUpPercentage = async (bounds, startDate, endDate) => {
  const ndbi = exports.calculateNDBI(bounds, startDate, endDate);
  const builtUp = ndbi.gt(0.1); // Built-up threshold

  const area = builtUp.multiply(ee.Image.pixelArea());
  const stats = area.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]),
    scale: 10,
    maxPixels: 1e9
  });

  return new Promise((resolve, reject) => {
    stats.evaluate((result, error) => {
      if (error) reject(error);
      else {
        const totalArea = (bounds.east - bounds.west) * (bounds.north - bounds.south) * 111000 * 111000;
        const builtArea = result.NDBI || 0;
        const percentage = (builtArea / totalArea) * 100;
        resolve(percentage.toFixed(2));
      }
    });
  });
};