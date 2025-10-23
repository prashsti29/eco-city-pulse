const { ee } = require('../../config/gee');

// Predefined coordinates for Bengaluru and Gurugram
const AREAS = {
  Bengaluru: {
    bounds: {
      north: 13.0569,
      south: 12.8340,
      east: 77.7800,
      west: 77.4600
    },
    name: 'Bengaluru (Bellandur & Varthur)'
  },
  Gurugram: {
    bounds: {
      north: 28.5000,
      south: 28.4000,
      east: 77.1000,
      west: 77.0000
    },
    name: 'Gurugram (Aravalli Region)'
  }
};

// Calculate NDVI for a specific year
const calculateYearlyNDVI = (bounds, year) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  let collection;
  if (year >= 1984 && year <= 2011) {
    collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
      .filterBounds(geometry)
      .filterDate(startDate, endDate);
  } else if (year >= 2013) {
    collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
      .filterBounds(geometry)
      .filterDate(startDate, endDate);
  } else {
    return null;
  }

  const ndvi = collection.map(img => {
    const nir = year <= 2011 ? img.select('SR_B4') : img.select('SR_B5');
    const red = year <= 2011 ? img.select('SR_B3') : img.select('SR_B4');
    return nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  }).median();

  return ndvi.clip(geometry);
};

// Calculate MNDWI for a specific year
const calculateYearlyMNDWI = (bounds, year) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  let collection;
  if (year >= 1984 && year <= 2011) {
    collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
      .filterBounds(geometry)
      .filterDate(startDate, endDate);
  } else if (year >= 2013) {
    collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
      .filterBounds(geometry)
      .filterDate(startDate, endDate);
  } else {
    return null;
  }

  const mndwi = collection.map(img => {
    const green = year <= 2011 ? img.select('SR_B2') : img.select('SR_B3');
    const swir = year <= 2011 ? img.select('SR_B5') : img.select('SR_B6');
    return green.subtract(swir).divide(green.add(swir)).rename('MNDWI');
  }).median();

  return mndwi.clip(geometry);
};

// Get statistics for a year
const getYearlyStats = async (bounds, year, indexType) => {
  const geometry = ee.Geometry.Rectangle([
    bounds.west, bounds.south, bounds.east, bounds.north
  ]);

  let image;
  if (indexType === 'ndvi') {
    image = calculateYearlyNDVI(bounds, year);
  } else {
    image = calculateYearlyMNDWI(bounds, year);
  }

  if (!image) {
    return null;
  }

  const stats = image.reduceRegion({
    reducer: ee.Reducer.mean().combine({
      reducer2: ee.Reducer.minMax(),
      sharedInputs: true
    }),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e9
  });

  return new Promise((resolve, reject) => {
    stats.evaluate((result, error) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

// Get map tile URL
const getMapTileUrl = async (bounds, year, indexType) => {
  let image;
  if (indexType === 'ndvi') {
    image = calculateYearlyNDVI(bounds, year);
  } else {
    image = calculateYearlyMNDWI(bounds, year);
  }

  if (!image) {
    return null;
  }

  const visParams = indexType === 'ndvi' 
    ? { min: -0.2, max: 0.8, palette: ['red', 'yellow', 'green'] }
    : { min: -0.5, max: 0.5, palette: ['white', 'blue'] };

  return new Promise((resolve, reject) => {
    image.getMap(visParams, (mapId, error) => {
      if (error) reject(error);
      else resolve(`https://earthengine.googleapis.com/v1alpha/${mapId.mapid}/tiles/{z}/{x}/{y}`);
    });
  });
};

// Export the main function
module.exports = { 
  getTimelineData: async (req, res) => {
    try {
      const { area, indexType } = req.query;

      if (!area || !AREAS[area]) {
        return res.status(400).json({
          success: false,
          message: 'Valid area required (Bengaluru or Gurugram)'
        });
      }

      if (!indexType || !['ndvi', 'mndwi'].includes(indexType)) {
        return res.status(400).json({
          success: false,
          message: 'Valid indexType required (ndvi or mndwi)'
        });
      }

      const bounds = AREAS[area].bounds;
      const years = [1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025];
      const timelineData = [];

      for (const year of years) {
        try {
          const stats = await getYearlyStats(bounds, year, indexType);
          const tileUrl = await getMapTileUrl(bounds, year, indexType);

          if (stats && tileUrl) {
            timelineData.push({
              year,
              mean: stats[`${indexType.toUpperCase()}_mean`]?.toFixed(3),
              min: stats[`${indexType.toUpperCase()}_min`]?.toFixed(3),
              max: stats[`${indexType.toUpperCase()}_max`]?.toFixed(3),
              tileUrl
            });
          }
        } catch (err) {
          console.error(`Error processing year ${year}:`, err);
        }
      }

      res.json({
        success: true,
        area: AREAS[area].name,
        indexType: indexType.toUpperCase(),
        data: timelineData
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};