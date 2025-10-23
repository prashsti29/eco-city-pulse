const wardService = require('../services/gee/ward.service');

// Compare multiple wards based on livability or environmental indices
exports.compareWards = async (req, res) => {
  try {
    const { wardIds, startDate, endDate } = req.body;

    if (!wardIds || wardIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two ward IDs are required for comparison.'
      });
    }

    const comparisonData = await wardService.compareWards(wardIds, startDate, endDate);

    res.status(200).json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    console.error('Error comparing wards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare wards.',
      error: error.message
    });
  }
};

// Get leaderboard of wards based on livability index or key metrics
exports.getWardLeaderboard = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.body;
    const leaderboard = await wardService.getWardLeaderboard(startDate, endDate, limit);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching ward leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard.',
      error: error.message
    });
  }
};

// Get detailed statistics for a single ward
exports.getWardDetails = async (req, res) => {
  try {
    const { wardId } = req.params;
    const { startDate, endDate } = req.query;

    if (!wardId) {
      return res.status(400).json({
        success: false,
        message: 'Ward ID is required.'
      });
    }

    const wardDetails = await wardService.getWardDetails(wardId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: wardDetails
    });
  } catch (error) {
    console.error('Error fetching ward details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ward details.',
      error: error.message
    });
  }
};
