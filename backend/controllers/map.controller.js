const ndviService = require('../services/gee/ndvi.service');
const mndwiService = require('../services/gee/mndwi.service');
const lstService = require('../services/gee/lst.service');
const ndbiService = require('../services/gee/ndbi.service');

// City configurations with real coordinates
const CITY_CONFIGS = {
  Bengaluru: {
    bounds: { north: 13.0569, south: 12.8340, east: 77.7800, west: 77.4600 },
    center: { lat: 12.9716, lng: 77.5946 }
  },
  Gurugram: {
    bounds: { north: 28.5000, south: 28.4000, east: 77.1000, west: 77.0000 },
    center: { lat: 28.4595, lng: 77.0266 }
  }
};

// Convert lat/lng to SVG coordinates (600x400 viewBox)
const toSVG = (lat, lng, bounds) => {
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 600;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 400;
  return { x, y };
};

exports.getMapData = async (req, res) => {
  try {
    const city = req.query.city || 'Bengaluru';
    
    if (!CITY_CONFIGS[city]) {
      return res.status(400).json({ error: 'Invalid city' });
    }

    const config = CITY_CONFIGS[city];
    const bounds = config.bounds;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate indices in parallel
    const [ndviStats, mndwiStats, lstStats, ndbiStats] = await Promise.all([
      ndviService.getNDVIStats(bounds, startDate, endDate).catch(() => null),
      mndwiService.getWaterBodyArea(bounds, startDate, endDate).catch(() => null),
      lstService.getAverageTemperature(bounds, startDate, endDate).catch(() => null),
      ndbiService.getNDBIStats(bounds, startDate, endDate).catch(() => null)
    ]);

    // Generate dynamic map features based on real data
    const mapData = {
      vegetation: generateVegetationPoints(ndviStats, bounds),
      water: generateWaterBodies(mndwiStats, bounds),
      heat: generateHeatHotspots(lstStats, bounds),
      encroachment: generateEncroachmentAreas(ndbiStats, bounds)
    };

    res.json(mapData);
  } catch (error) {
    console.error('Map data error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate vegetation points based on NDVI data
function generateVegetationPoints(ndviStats, bounds) {
  const points = [];
  
  if (!ndviStats) {
    // Fallback data
    return [
      { x: 120, y: 80, r: 35, label: 'Park' },
      { x: 480, y: 120, r: 40, label: 'Forest' },
      { x: 180, y: 300, r: 30, label: 'Green' }
    ];
  }

  const ndviMean = ndviStats.NDVI_mean || 0;
  
  // High vegetation areas (simplified - in production use actual spatial data)
  if (ndviMean > 0.4) {
    points.push(
      { x: 120, y: 80, r: 40, label: 'Dense' },
      { x: 480, y: 120, r: 45, label: 'Forest' },
      { x: 180, y: 300, r: 35, label: 'Park' }
    );
  } else if (ndviMean > 0.2) {
    points.push(
      { x: 150, y: 100, r: 30, label: 'Park' },
      { x: 450, y: 150, r: 35, label: 'Green' }
    );
  } else {
    points.push({ x: 200, y: 180, r: 25, label: 'Small' });
  }

  return points;
}

// Generate water bodies based on MNDWI
function generateWaterBodies(waterArea, bounds) {
  const bodies = [];
  
  if (!waterArea || parseFloat(waterArea) < 0.1) {
    return [{ x: 350, y: 180, rx: 30, ry: 25, label: 'Pond', type: 'ellipse' }];
  }

  const area = parseFloat(waterArea);
  
  if (area > 5) {
    bodies.push(
      { x: 350, y: 180, rx: 60, ry: 50, label: 'Lake', type: 'ellipse' },
      { x: 500, y: 305, rx: 35, ry: 30, label: 'River', type: 'rect' }
    );
  } else if (area > 1) {
    bodies.push(
      { x: 350, y: 180, rx: 50, ry: 40, label: 'Lake', type: 'ellipse' }
    );
  } else {
    bodies.push(
      { x: 350, y: 180, rx: 30, ry: 25, label: 'Pond', type: 'ellipse' }
    );
  }

  return bodies;
}

// Generate heat hotspots based on LST
function generateHeatHotspots(lstTemp, bounds) {
  const hotspots = [];
  
  if (!lstTemp || lstTemp === 'too large area') {
    return [
      { x: 100, y: 250, r: 28, label: 'Hot' },
      { x: 420, y: 100, r: 25, label: 'Heat' }
    ];
  }

  const temp = parseFloat(lstTemp);
  
  if (temp > 38) {
    hotspots.push(
      { x: 100, y: 250, r: 35, label: 'Critical' },
      { x: 420, y: 100, r: 32, label: 'Hot' },
      { x: 300, y: 50, r: 28, label: 'Heat' }
    );
  } else if (temp > 35) {
    hotspots.push(
      { x: 100, y: 250, r: 28, label: 'Hot' },
      { x: 420, y: 100, r: 25, label: 'Heat' }
    );
  } else if (temp > 32) {
    hotspots.push({ x: 200, y: 180, r: 22, label: 'Warm' });
  }

  return hotspots;
}

// Generate encroachment areas based on NDBI
function generateEncroachmentAreas(ndbiStats, bounds) {
  const areas = [];
  
  if (!ndbiStats) {
    return [];
  }

  const ndbiMean = ndbiStats.NDBI_mean || 0;
  
  if (ndbiMean > 0.2) {
    areas.push(
      { x: 70, y: 160, width: 55, height: 55, label: 'Encr.' },
      { x: 520, y: 320, width: 60, height: 45, label: 'Build' }
    );
  } else if (ndbiMean > 0.1) {
    areas.push({ x: 100, y: 180, width: 50, height: 50, label: 'Encr.' });
  }

  return areas;
}