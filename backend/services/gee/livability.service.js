const { ee } = require('../../config/gee');
const ndviService = require('./ndvi.service');
const lstService = require('./lst.service');
const mndwiService = require('./mndwi.service');
const ndbiService = require('./ndbi.service');

// Calculate Livability Index for a single grid cell
const calculateCellLivability = async (bounds, startDate, endDate) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  try {
    // Check image collection sizes first
    const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);
    
    const s2Count = ee.ImageCollection('COPERNICUS/S2_SR')
      .filterBounds(geometry)
      .filterDate(startDate, endDate)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
      .size();

    const countResult = await new Promise((res, rej) => 
      s2Count.evaluate((r, e) => e ? rej(e) : res(r))
    );

    if (countResult === 0) {
      throw new Error('No satellite imagery available for this location/date range');
    }

    // Fetch all indices
    const ndvi = ndviService.calculateNDVI(bounds, startDate, endDate);
    const mndwi = mndwiService.calculateMNDWI(bounds, startDate, endDate);
    const lst = lstService.calculateLST(bounds, startDate, endDate);
    const ndbi = ndbiService.calculateNDBI(bounds, startDate, endDate);

    // Normalize indices
    const ndviNorm = ndvi.unitScale(-0.2, 0.8);
    const mndwiNorm = mndwi.unitScale(-0.5, 0.5);
    const lstNorm = lst.unitScale(20, 50);
    const ndbiNorm = ndbi.unitScale(-0.2, 0.5);

    // Calculate LIV (simplified inversion)
    const liv = ndviNorm.multiply(0.4)
      .add(mndwiNorm.multiply(0.3))
      .add(lstNorm.multiply(-0.2).add(0.2))
      .add(ndbiNorm.multiply(-0.1).add(0.1));

    // Rename LIV band so we can identify it
    const livNamed = liv.rename('LIV');

    // Get LIV statistics
    const livStats = livNamed.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry,
      scale: 30,
      maxPixels: 1e9,
      bestEffort: true
    });

    // Get individual metrics in parallel
    const [livResult, ndviStats, mndwiStats, lstStats, ndbiStats] = await Promise.all([
      new Promise((res, rej) => livStats.evaluate((r, e) => e ? rej(e) : res(r))),
      new Promise((res, rej) => 
        ndvi.reduceRegion({ 
          reducer: ee.Reducer.mean(), 
          geometry, 
          scale: 30, 
          maxPixels: 1e9,
          bestEffort: true 
        }).evaluate((r, e) => e ? rej(e) : res(r))
      ),
      new Promise((res, rej) => 
        mndwi.reduceRegion({ 
          reducer: ee.Reducer.mean(), 
          geometry, 
          scale: 30, 
          maxPixels: 1e9,
          bestEffort: true 
        }).evaluate((r, e) => e ? rej(e) : res(r))
      ),
      new Promise((res, rej) => 
        lst.reduceRegion({ 
          reducer: ee.Reducer.mean(), 
          geometry, 
          scale: 30, 
          maxPixels: 1e9,
          bestEffort: true 
        }).evaluate((r, e) => e ? rej(e) : res(r))
      ),
      new Promise((res, rej) => 
        ndbi.reduceRegion({ 
          reducer: ee.Reducer.mean(), 
          geometry, 
          scale: 30, 
          maxPixels: 1e9,
          bestEffort: true 
        }).evaluate((r, e) => e ? rej(e) : res(r))
      )
    ]);

    if (!livResult || livResult.LIV === undefined) {
      console.log('LIV result:', livResult);
      throw new Error('No LIV data returned from GEE');
    }

    return {
      liv: livResult.LIV,
      ndvi: ndviStats?.NDVI ?? null,
      mndwi: mndwiStats?.MNDWI ?? null,
      lst: lstStats?.LST ?? null,
      ndbi: ndbiStats?.NDBI ?? null
    };
  } catch (error) {
    throw new Error(`GEE calculation failed: ${error.message || error}`);
  }
};

// Divide area into grid and calculate LIV for each cell
exports.calculateGridLivability = async (bounds, startDate, endDate, gridSize = 0.03) => {
  const cells = [];

  // Create grid cells
  for (let lat = bounds.south; lat < bounds.north; lat += gridSize) {
    for (let lng = bounds.west; lng < bounds.east; lng += gridSize) {
      cells.push({
        bounds: {
          north: Math.min(lat + gridSize, bounds.north),
          south: lat,
          east: Math.min(lng + gridSize, bounds.east),
          west: lng
        },
        center: {
          lat: lat + gridSize / 2,
          lng: lng + gridSize / 2
        }
      });
    }
  }

  console.log(`Calculating livability for ${cells.length} grid cells...`);

  const results = [];
  for (const cell of cells) {
    try {
      const livData = await calculateCellLivability(cell.bounds, startDate, endDate);

      if (livData.liv !== null && !isNaN(livData.liv)) {
        results.push({
          ...cell,
          livability: livData.liv,
          metrics: {
            ndvi: livData.ndvi,
            mndwi: livData.mndwi,
            lst: livData.lst,
            ndbi: livData.ndbi
          }
        });
      }
    } catch (error) {
      console.error(`❌ Cell at ${cell.center.lat.toFixed(3)}, ${cell.center.lng.toFixed(3)} failed:`, error.message);
    }
  }

  console.log(`✅ Successfully calculated ${results.length}/${cells.length} cells`);
  return results;
};

// Generate descriptive insights for a cell's livability
const generateInsights = (metrics) => {
  const insights = [];

  if (metrics.ndvi > 0.4) insights.push('High vegetation cover');
  else if (metrics.ndvi > 0.2) insights.push('Moderate green spaces');
  else insights.push('Limited vegetation');

  if (metrics.mndwi > 0.3) insights.push('Water bodies nearby');
  else if (metrics.mndwi > 0.1) insights.push('Some water presence');

  if (metrics.lst < 30) insights.push('Cool temperature');
  else if (metrics.lst < 35) insights.push('Moderate temperature');
  else insights.push('High temperature');

  if (metrics.ndbi < 0) insights.push('Low built-up density');
  else if (metrics.ndbi < 0.2) insights.push('Moderate urbanization');
  else insights.push('Highly urbanized');

  return insights;
};

// Get top 3 most livable grid areas
exports.getTop3Livable = async (bounds, startDate, endDate, filter = 'overall') => {
  const gridResults = await exports.calculateGridLivability(bounds, startDate, endDate);

  if (gridResults.length === 0) {
    throw new Error('No valid grid cells found - check date range and location have satellite coverage');
  }

  let sortedResults;
  switch (filter) {
    case 'coolest':
      sortedResults = gridResults
        .filter(r => r.metrics.lst !== null)
        .sort((a, b) => a.metrics.lst - b.metrics.lst);
      break;
    case 'greenest':
      sortedResults = gridResults
        .filter(r => r.metrics.ndvi !== null)
        .sort((a, b) => b.metrics.ndvi - a.metrics.ndvi);
      break;
    case 'water':
      sortedResults = gridResults
        .filter(r => r.metrics.mndwi !== null)
        .sort((a, b) => b.metrics.mndwi - a.metrics.mndwi);
      break;
    case 'overall':
    default:
      sortedResults = gridResults.sort((a, b) => b.livability - a.livability);
  }

  const top3 = sortedResults.slice(0, 3).map((area, index) => ({
    rank: index + 1,
    location: area.center,
    bounds: area.bounds,
    livabilityScore: area.livability.toFixed(3),
    metrics: {
      ndvi: area.metrics.ndvi?.toFixed(3) || 'N/A',
      mndwi: area.metrics.mndwi?.toFixed(3) || 'N/A',
      lst: area.metrics.lst?.toFixed(2) || 'N/A',
      ndbi: area.metrics.ndbi?.toFixed(3) || 'N/A'
    },
    insights: generateInsights(area.metrics),
    filter
  }));

  return top3;
};

// Compare user's area livability with a top-ranked area
exports.compareWithLocation = async (userBounds, topAreaBounds, startDate, endDate) => {
  const [userData, topAreaData] = await Promise.all([
    calculateCellLivability(userBounds, startDate, endDate),
    calculateCellLivability(topAreaBounds, startDate, endDate)
  ]);

  const comparison = {
    yourArea: {
      livability: userData.liv?.toFixed(3),
      metrics: {
        ndvi: userData.ndvi?.toFixed(3),
        mndwi: userData.mndwi?.toFixed(3),
        lst: userData.lst?.toFixed(2),
        ndbi: userData.ndbi?.toFixed(3)
      },
      insights: generateInsights(userData)
    },
    topArea: {
      livability: topAreaData.liv?.toFixed(3),
      metrics: {
        ndvi: topAreaData.ndvi?.toFixed(3),
        mndwi: topAreaData.mndwi?.toFixed(3),
        lst: topAreaData.lst?.toFixed(2),
        ndbi: topAreaData.ndbi?.toFixed(3)
      },
      insights: generateInsights(topAreaData)
    },
    differences: {
      livability: (topAreaData.liv - userData.liv).toFixed(3),
      ndvi: (topAreaData.ndvi - userData.ndvi).toFixed(3),
      lst: (topAreaData.lst - userData.lst).toFixed(2),
      improvements: []
    }
  };

  if (topAreaData.ndvi > userData.ndvi + 0.1)
    comparison.differences.improvements.push('Top area has significantly more green cover');
  if (topAreaData.lst < userData.lst - 2)
    comparison.differences.improvements.push(`Top area is cooler by ${(userData.lst - topAreaData.lst).toFixed(1)}°C`);
  if (topAreaData.mndwi > userData.mndwi + 0.1)
    comparison.differences.improvements.push('Top area has better water access');

  return comparison;
};

module.exports = {
  calculateGridLivability: exports.calculateGridLivability,
  getTop3Livable: exports.getTop3Livable,
  compareWithLocation: exports.compareWithLocation
};