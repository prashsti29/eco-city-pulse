const timelineService = require('../services/gee/timeline.service');

exports.getTimelineData = async (req, res) => {
  try {
    const { area, indexType } = req.query;
    const data = await timelineService.getHistoricalData(area, indexType);
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};