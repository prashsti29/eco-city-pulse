const express = require('express');
const router = express.Router();
const ndviService = require('../services/gee/ndvi.service');
const mndwiService = require('../services/gee/mndwi.service');
const lstService = require('../services/gee/lst.service');
const ndbiService = require('../services/gee/ndbi.service');

// Calculate URI directly from raw metrics
const calculateURIFromMetrics = (ndvi, lst, mndwi) => {
  // Normalize each metric to 0-1 scale
  const ndviNorm = Math.max(0, Math.min(1, (ndvi + 0.2) / 1.0));
  const lstNorm = Math.max(0, Math.min(1, (45 - lst) / 30)); // Inverted: cooler is better
  const mndwiNorm = Math.max(0, Math.min(1, (mndwi + 0.5) / 1.0));
  
  // Weighted average (NDVI 40%, LST 30%, MNDWI 30%)
  const uri = (ndviNorm * 0.4 + lstNorm * 0.3 + mndwiNorm * 0.3) * 100;
  return uri;
};

// Normalize city names
const normalizeCityName = (city) => {
  const cityLower = city.toLowerCase().trim();
  if (cityLower.includes('bengaluru') || cityLower.includes('bangalore')) {
    return 'Bengaluru';
  }
  if (cityLower.includes('gurgaon') || cityLower.includes('gurugram')) {
    return 'Gurugram';
  }
  return city;
};

router.get('/', async (req, res) => {
  try {
    const rawCity = req.query.city || 'Bengaluru';
    const city = normalizeCityName(rawCity);
    
    console.log(`Raw city: ${rawCity}, Normalized: ${city}`);
    
    const BOUNDS = {
      'Bengaluru': {
        north: 13.05,
        south: 12.95,
        east: 77.65,
        west: 77.55
      },
      'Gurugram': {
        north: 28.48,
        south: 28.40,
        east: 77.08,
        west: 77.00
      }
    };

    const bounds = BOUNDS[city];
    if (!bounds) {
      console.error(`Invalid city: ${city} (original: ${rawCity})`);
      return res.status(400).json({ 
        error: `Invalid city: ${rawCity}. Supported cities: Bengaluru, Gurugram`,
        uriData: [],
        componentData: [],
        metrics: { avgURI: "0.0", avgEncroachment: "0.0" }
      });
    }

    const startDate = '2023-06-01';
    const endDate = '2023-08-31';

    console.log(`\n📊 Calculating real URI for ${city}...`);

    // Calculate for 4 grid cells
    const gridSize = 0.05;
    const areaNames = city === 'Bengaluru' 
      ? ['Whitefield', 'Koramangala', 'Indiranagar', 'Jayanagar']
      : ['DLF Phase 1', 'Cyber City', 'Golf Course Road', 'Sohna Road'];
    
    const uriData = [];
    let cellNum = 0;

    for (let lat = bounds.south; lat < bounds.north && cellNum < 4; lat += gridSize) {
      for (let lng = bounds.west; lng < bounds.east && cellNum < 4; lng += gridSize) {
        const cellBounds = {
          north: Math.min(lat + gridSize, bounds.north),
          south: lat,
          east: Math.min(lng + gridSize, bounds.east),
          west: lng
        };

        try {
          console.log(`\n🔍 Calculating ${areaNames[cellNum]}...`);

          // Get real GEE data
          const [ndviStats, lstAvg, mndwiStats, ndbiStats] = await Promise.all([
            ndviService.getNDVIStats(cellBounds, startDate, endDate),
            lstService.getAverageTemperature(cellBounds, startDate, endDate),
            mndwiService.getWaterBodyArea(cellBounds, startDate, endDate).catch(() => 0),
            ndbiService.getNDBIStats(cellBounds, startDate, endDate).catch(() => ({ NDBI: 0 }))
          ]);

          const ndviMean = ndviStats?.NDVI_mean || 0;
          const lstValue = parseFloat(lstAvg) || 35;
          const mndwiValue = parseFloat(mndwiStats) || 0;
          const ndbiMean = ndbiStats?.NDBI || 0;

          console.log(`   NDVI: ${ndviMean.toFixed(3)}, LST: ${lstValue}°C, MNDWI: ${mndwiValue}`);

          const uri = calculateURIFromMetrics(ndviMean, lstValue, mndwiValue);
          
          // Calculate encroachment (high NDBI + low NDVI = encroachment)
          const encroachment = Math.max(0, (ndbiMean * 0.5 - ndviMean * 0.5 + 0.5) * 5);

          uriData.push({
            area: areaNames[cellNum],
            uri: parseFloat(uri.toFixed(1)),
            encroachment: parseFloat(encroachment.toFixed(1))
          });

          console.log(`   ✅ URI: ${uri.toFixed(1)}%, Encroachment: ${encroachment.toFixed(1)}%`);

        } catch (err) {
          console.error(`   ❌ Error: ${err.message}`);
        }
        
        cellNum++;
      }
    }

    if (uriData.length === 0) {
      throw new Error('No data calculated');
    }

    // Calculate component breakdown from first cell's data
    const firstCell = {
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west
    };

    const [overallNDVI, overallLST, overallMNDWI] = await Promise.all([
      ndviService.getNDVIStats(firstCell, startDate, endDate),
      lstService.getAverageTemperature(firstCell, startDate, endDate),
      mndwiService.getWaterBodyArea(firstCell, startDate, endDate).catch(() => 0)
    ]);

    const componentData = [
      { 
        name: "NDVI", 
        value: parseFloat(((overallNDVI?.NDVI_mean + 0.2) / 1.0 * 100).toFixed(1))
      },
      { 
        name: "MNDWI", 
        value: parseFloat((parseFloat(overallMNDWI) > 0 ? 60 : 30).toFixed(1))
      },
      { 
        name: "LST", 
        value: parseFloat(((45 - parseFloat(overallLST)) / 30 * 100).toFixed(1))
      }
    ];

    const avgURI = (uriData.reduce((sum, d) => sum + d.uri, 0) / uriData.length).toFixed(1);
    const avgEncroachment = (uriData.reduce((sum, d) => sum + d.encroachment, 0) / uriData.length).toFixed(1);

    console.log(`\n✅ Complete! Average URI: ${avgURI}%\n`);

    res.json({
      uriData,
      componentData,
      metrics: {
        avgURI,
        avgEncroachment
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      error: error.message,
      uriData: [],
      componentData: [],
      metrics: { avgURI: "0.0", avgEncroachment: "0.0" }
    });
  }
});

module.exports = router;