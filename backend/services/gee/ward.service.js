const { ee } = require('../../config/gee');
const ndviService = require('./ndvi.service');
const lstService = require('./lst.service');
const mndwiService = require('./mndwi.service');
const ndbiService = require('./ndbi.service');
const livabilityService = require('./livability.service');

// Helper: Calculate livability score for a ward polygon
const calculateWardLivability = async (wardGeometry, startDate, endDate) => {
  const [ndvi, lst, mndwi, ndbi] = await Promise.all([
    ndviService.getMeanNDVI(wardGeometry, startDate, endDate),
    lstService.getMeanLST(wardGeometry, startDate, endDate),
    mndwiService.getMeanMNDWI(wardGeometry, startDate, endDate),
    ndbiService.getMeanNDBI(wardGeometry, startDate, endDate),
  ]);

  const livabilityIndex = await livabilityService.calculateLivabilityIndex({ ndvi, lst, mndwi, ndbi });
  return { ndvi, lst, mndwi, ndbi, livabilityIndex };
};

// Compare multiple wards
exports.compareWards = async (wardIds, startDate, endDate) => {
  const results = [];

  for (const wardId of wardIds) {
    const wardFeature = await ee.FeatureCollection('users/your_asset/Wards')
      .filter(ee.Filter.eq('ward_id', wardId))
      .first();

    const geometry = wardFeature.geometry();
    const wardStats = await calculateWardLivability(geometry, startDate, endDate);

    results.push({
      wardId,
      ...wardStats
    });
  }

  // Sort by livability descending
  return results.sort((a, b) => b.livabilityIndex - a.livabilityIndex);
};

// Leaderboard of wards
exports.getWardLeaderboard = async (startDate, endDate, limit = 10) => {
  const wards = ee.FeatureCollection('users/your_asset/Wards');
  const wardList = await wards.toList(wards.size()).getInfo();

  const leaderboard = [];

  for (const ward of wardList) {
    const geometry = ee.Feature(ward).geometry();
    const wardId = ward.properties.ward_id;

    const stats = await calculateWardLivability(geometry, startDate, endDate);
    leaderboard.push({ wardId, ...stats });
  }

  return leaderboard
    .sort((a, b) => b.livabilityIndex - a.livabilityIndex)
    .slice(0, limit);
};

// Get details for a single ward
exports.getWardDetails = async (wardId, startDate, endDate) => {
  const wardFeature = await ee.FeatureCollection('users/your_asset/Wards')
    .filter(ee.Filter.eq('ward_id', wardId))
    .first();

  const geometry = wardFeature.geometry();
  const stats = await calculateWardLivability(geometry, startDate, endDate);

  return {
    wardId,
    ...stats
  };
};
