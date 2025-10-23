const { ee } = require('../../config/gee');

exports.calculateMNDWI = (bounds, startDate, endDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  const s2 = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

  const mndwi = s2.map(img => {
    return img.normalizedDifference(['B3', 'B11']).rename('MNDWI');
  }).mean();

  return mndwi.clip(geometry);
};

exports.getWaterBodyArea = async (bounds, startDate, endDate) => {
  const mndwi = exports.calculateMNDWI(bounds, startDate, endDate);
  const water = mndwi.gt(0.3); // Water threshold

  const area = water.multiply(ee.Image.pixelArea());
  const stats = area.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]),
    scale: 10,
    maxPixels: 1e9
  });

  return new Promise((resolve, reject) => {
    stats.evaluate((result, error) => {
      if (error) reject(error);
      else resolve((result.MNDWI / 1000000).toFixed(2)); // Convert to km²
    });
  });
};