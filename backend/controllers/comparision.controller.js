// controllers/comparison.controller.js (CREATE THIS)
exports.compareLivAndUri = async (req, res) => {
  try {
    const { bounds, startDate, endDate } = req.body;
    
    // Calculate both indices in parallel
    const [liv, uri] = await Promise.all([
      livabilityService.calculateCellLivability(bounds, startDate, endDate),
      uriService.calculateURI(bounds, startDate, endDate)
    ]);
    
    // Calculate correlation (simplified)
    const correlation = calculatePearsonCorrelation(liv.liv, parseFloat(uri.uri));
    
    // Get tile URLs for maps
    const [livTileUrl, uriTileUrl] = await Promise.all([
      mapTilesService.getLivabilityHeatmapTileUrl(bounds, startDate, endDate),
      mapTilesService.getURIHeatmapTileUrl(bounds, startDate, endDate)
    ]);
    
    res.json({
      success: true,
      data: {
        livability: {
          score: liv.liv?.toFixed(3),
          metrics: liv,
          tileUrl: livTileUrl
        },
        resilience: {
          score: uri.uri,
          breakdown: uri.breakdown,
          tileUrl: uriTileUrl
        },
        correlation: correlation?.toFixed(3),
        analysis: generateComparison(liv, uri)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const calculatePearsonCorrelation = (x, y) => {
  // Simple correlation for two values
  return 0.75; // Placeholder - implement proper correlation for arrays
};

const generateComparison = (liv, uri) => {
  const insights = [];
  
  if (liv.liv > 0.7 && parseFloat(uri.uri) > 0.7) {
    insights.push('Area has both high livability and resilience');
  } else if (liv.liv > 0.7 && parseFloat(uri.uri) < 0.5) {
    insights.push('Good livability but low resilience - vulnerable to climate change');
  } else if (liv.liv < 0.5 && parseFloat(uri.uri) > 0.7) {
    insights.push('Good resilience but needs livability improvements');
  }
  
  return insights;
};