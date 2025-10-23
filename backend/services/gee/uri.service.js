const { ee } = require('../../config/gee');
const ndviService = require('./ndvi.service');
const mndwiService = require('./mndwi.service');
const lstService = require('./lst.service');
const ndbiService = require('./ndbi.service');

// URI combines resilience factors
exports.calculateURI = async (bounds, startDate, endDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  const ndvi = ndviService.calculateNDVI(bounds, startDate, endDate);
  const mndwi = mndwiService.calculateMNDWI(bounds, startDate, endDate);
  const lst = lstService.calculateLST(bounds, startDate, endDate);
  
  // Get past year data for resilience trend
  const pastYear = new Date(startDate);
  pastYear.setFullYear(pastYear.getFullYear() - 5);
  const pastNdvi = ndviService.calculateNDVI(bounds, pastYear.toISOString().split('T')[0], startDate);
  
  // Normalize
  const ndviNorm = ndvi.unitScale(-0.2, 0.8);
  const mndwiNorm = mndwi.unitScale(-0.5, 0.5);
  const lstNorm = lst.unitScale(50, 20);
  
  // Resilience = current conditions + trend stability
  const ndviChange = ndvi.subtract(pastNdvi).abs();
  const stability = ndviChange.unitScale(0.5, 0).multiply(0.2); // Less change = more resilient
  
  const uri = ndviNorm.multiply(0.35)
    .add(mndwiNorm.multiply(0.25))
    .add(lstNorm.multiply(0.2))
    .add(stability);

  const stats = uri.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e9
  });

  return new Promise((resolve, reject) => {
    stats.evaluate((result, error) => {
      if (error) reject(error);
      else resolve({
        uri: result.constant_mean?.toFixed(3),
        breakdown: {
          vegetation: (result.constant_mean * 0.35).toFixed(3),
          water: (result.constant_mean * 0.25).toFixed(3),
          temperature: (result.constant_mean * 0.2).toFixed(3),
          stability: (result.constant_mean * 0.2).toFixed(3)
        }
      });
    });
  });
};

exports.getURIWithEncroachment = async (bounds, startDate, endDate) => {
  // Include encroachment penalty in URI calculation
  const baseURI = await exports.calculateURI(bounds, startDate, endDate);
  
  const pastYear = new Date(startDate);
  pastYear.setFullYear(pastYear.getFullYear() - 5);
  const pastDate = pastYear.toISOString().split('T')[0];
  
  const currentNDVI = ndviService.calculateNDVI(bounds, startDate, endDate);
  const pastNDVI = ndviService.calculateNDVI(bounds, pastDate, startDate);
  const ndviLoss = pastNDVI.subtract(currentNDVI).gt(0.2);
  
  const encroachmentPenalty = ndviLoss.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]),
    scale: 30,
    maxPixels: 1e9
  });
  
  return new Promise((resolve, reject) => {
    encroachmentPenalty.evaluate((result, error) => {
      if (error) reject(error);
      else {
        const penalty = result.NDVI || 0;
        const adjustedURI = parseFloat(baseURI.uri) - (penalty * 0.3);
        resolve({
          uri: adjustedURI.toFixed(3),
          baseURI: baseURI.uri,
          encroachmentPenalty: (penalty * 0.3).toFixed(3)
        });
      }
    });
  });
};