const { ee } = require('../../config/gee');
const ndviService = require('./ndvi.service');
const mndwiService = require('./mndwi.service');
const lstService = require('./lst.service');
const ndbiService = require('./ndbi.service');

// Simplified URI without past data comparison
exports.calculateURI = async (bounds, startDate, endDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  try {
    // Get current indices
    const ndvi = ndviService.calculateNDVI(bounds, startDate, endDate);
    const mndwi = mndwiService.calculateMNDWI(bounds, startDate, endDate);
    const lst = lstService.calculateLST(bounds, startDate, endDate);
    
    // Normalize to 0-1 range
    const ndviNorm = ndvi.unitScale(-0.2, 0.8);
    const mndwiNorm = mndwi.unitScale(-0.5, 0.5);
    const lstNorm = lst.unitScale(15, 45).multiply(-1).add(1); // Invert: cooler = better
    
    // Calculate weighted URI
    const uri = ndviNorm.multiply(0.4)
      .add(mndwiNorm.multiply(0.3))
      .add(lstNorm.multiply(0.3));

    const stats = uri.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometry,
      scale: 30,
      maxPixels: 1e9,
      bestEffort: true
    });

    return new Promise((resolve, reject) => {
      stats.evaluate((result, error) => {
        if (error) {
          console.error('URI eval error:', error);
          reject(error);
        } else {
          const uriValue = result.constant || 0;
          console.log(`URI calculated: ${uriValue}`);
          
          resolve({
            uri: uriValue.toFixed(3),
            breakdown: {
              vegetation: (uriValue * 0.4).toFixed(3),
              water: (uriValue * 0.3).toFixed(3),
              temperature: (uriValue * 0.3).toFixed(3)
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('URI calculation error:', error);
    throw error;
  }
};

exports.getURIWithEncroachment = async (bounds, startDate, endDate) => {
  try {
    // Get base URI
    const baseURI = await exports.calculateURI(bounds, startDate, endDate);
    
    // Calculate encroachment if we have enough historical data
    let encroachmentPenalty = 0;
    
    try {
      const pastYear = new Date(startDate);
      pastYear.setFullYear(pastYear.getFullYear() - 1);
      const pastStartDate = pastYear.toISOString().split('T')[0];
      
      // Only try if past date is after 2013 (Landsat 8 availability)
      if (pastYear.getFullYear() >= 2015) {
        const currentNDVI = ndviService.calculateNDVI(bounds, startDate, endDate);
        const pastNDVI = ndviService.calculateNDVI(bounds, pastStartDate, startDate);
        const currentNDBI = ndbiService.calculateNDBI(bounds, startDate, endDate);
        
        const ndviLoss = pastNDVI.subtract(currentNDVI).gt(0.2);
        const ndbiGain = currentNDBI.gt(0.1);
        const encroachment = ndviLoss.and(ndbiGain);
        
        const encroachmentStats = encroachment.reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry: ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]),
          scale: 30,
          maxPixels: 1e9,
          bestEffort: true
        });
        
        const encResult = await new Promise((resolve, reject) => {
          encroachmentStats.evaluate((result, error) => {
            if (error) reject(error);
            else resolve(result.constant || 0);
          });
        });
        
        encroachmentPenalty = encResult * 0.3;
      }
    } catch (encError) {
      console.log('Encroachment calc skipped:', encError.message);
    }
    
    const adjustedURI = Math.max(0, parseFloat(baseURI.uri) - encroachmentPenalty);
    
    return {
      uri: adjustedURI.toFixed(3),
      baseURI: baseURI.uri,
      encroachmentPenalty: encroachmentPenalty.toFixed(3)
    };
    
  } catch (error) {
    console.error('URI with encroachment error:', error);
    throw error;
  }
};