const uriService = require('../services/gee/uri.service');

exports.getUrbanResilienceIndex = async (req, res) => {
  try {
    const { bounds, startDate, endDate } = req.body;

    if (!bounds || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'bounds, startDate, endDate required'
      });
    }

    const uri = await uriService.calculateURI(bounds, startDate, endDate);

    res.json({
      success: true,
      data: uri
    });
  } catch (error) {
    console.error('URI Calculation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getURIWithEncroachment = async (req, res) => {
  try {
    const { bounds, startDate, endDate } = req.body;

    if (!bounds || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'bounds, startDate, endDate required'
      });
    }

    const uriData = await uriService.getURIWithEncroachment(bounds, startDate, endDate);

    res.json({
      success: true,
      data: uriData
    });
  } catch (error) {
    console.error('URI with Encroachment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUrbanResilienceIndex: exports.getUrbanResilienceIndex,
  getURIWithEncroachment: exports.getURIWithEncroachment
};