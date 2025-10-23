// controllers/overview.controller.js (NEW)
exports.getCityOverview = async (req, res) => {
  const { cityName, bounds } = req.body;
  
  const [liv, uri, greenCover, heatLevel] = await Promise.all([
    livabilityService.calculateCityAverageLIV(bounds),
    uriService.calculateCityAverageURI(bounds),
    ndviService.getGreenCoverPercentage(bounds, startDate, endDate),
    lstService.getAverageTemperature(bounds, startDate, endDate)
  ]);
  
  res.json({
    success: true,
    data: {
      cityName,
      averageLIV: liv,
      averageURI: uri,
      vegetationCover: greenCover,
      heatLevel,
      timestamp: new Date()
    }
  });
};