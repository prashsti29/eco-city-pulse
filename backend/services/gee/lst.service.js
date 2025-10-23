const { ee } = require('../../config/gee');

exports.calculateLST = (bounds, startDate, endDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  const landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUD_COVER', 20));

  const lst = landsat.map(img => {
    const thermal = img.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15);
    return thermal.rename('LST');
  }).mean();

  return lst.clip(geometry);
};

exports.getAverageTemperature = async (bounds, startDate, endDate) => {
  // Check if area is too large
  const area = (bounds.east - bounds.west) * (bounds.north - bounds.south);
  if (area > 1) { // More than ~100km x 100km
    return "too large area";
  }

  const lst = exports.calculateLST(bounds, startDate, endDate);
  
  const stats = lst.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]),
    scale: 30,
    maxPixels: 1e9
  });

  return new Promise((resolve, reject) => {
    stats.evaluate((result, error) => {
      if (error) reject(error);
      else resolve(result.LST ? result.LST.toFixed(2) : null);
    });
  });
};