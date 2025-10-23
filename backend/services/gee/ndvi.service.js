const { ee } = require('../../config/gee');

exports.calculateNDVI = (bounds, startDate, endDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  const s2 = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

  const ndvi = s2.map(img => {
    return img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  }).mean();

  return ndvi.clip(geometry);
};

exports.getNDVIStats = async (bounds, startDate, endDate) => {
  const ndvi = exports.calculateNDVI(bounds, startDate, endDate);
  
  const stats = ndvi.reduceRegion({
    reducer: ee.Reducer.mean().combine({
      reducer2: ee.Reducer.minMax(),
      sharedInputs: true
    }),
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

exports.getGreenCoverPercentage = async (bounds, startDate, endDate) => {
  const ndvi = exports.calculateNDVI(bounds, startDate, endDate);
  const vegetation = ndvi.gt(0.3); // Threshold for vegetation

  const area = vegetation.multiply(ee.Image.pixelArea());
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
        const greenArea = result.NDVI || 0;
        const percentage = (greenArea / totalArea) * 100;
        resolve(percentage.toFixed(2));
      }
    });
  });
};