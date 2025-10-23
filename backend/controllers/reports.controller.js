const Report = require('../models/report');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { title, description, category, location, severity, images } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location are required'
      });
    }

    const report = await Report.create({
      title,
      description,
      category,
      location,
      severity: severity || 'medium',
      images: images || [],
      createdBy: req.user._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reports with filters
exports.getReports = async (req, res) => {
  try {
    const { status, category, severity, userId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (userId) filter.createdBy = userId;

    const reports = await Report.find(filter)
      .populate('createdBy', 'username name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'username name role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update report status (officials only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    if (notes) report.officialNotes = notes;
    report.updatedAt = Date.now();

    await report.save();

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Only allow creator or officials to delete
    if (report.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get report analytics
exports.getReportAnalytics = async (req, res) => {
  try {
    const { bounds } = req.body;

    const filter = {};
    if (bounds) {
      filter['location.lat'] = { $gte: bounds.south, $lte: bounds.north };
      filter['location.lng'] = { $gte: bounds.west, $lte: bounds.east };
    }

    const reports = await Report.find(filter);

    const analytics = {
      totalReports: reports.length,
      byCategory: {},
      byStatus: {},
      bySeverity: {},
      heatmapData: reports.map(r => ({
        lat: r.location.lat,
        lng: r.location.lng,
        severity: r.severity,
        category: r.category
      }))
    };

    // Count by category
    reports.forEach(r => {
      analytics.byCategory[r.category] = (analytics.byCategory[r.category] || 0) + 1;
      analytics.byStatus[r.status] = (analytics.byStatus[r.status] || 0) + 1;
      analytics.bySeverity[r.severity] = (analytics.bySeverity[r.severity] || 0) + 1;
    });

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReport: exports.createReport,
  getReports: exports.getReports,
  getReportById: exports.getReportById,
  updateReportStatus: exports.updateReportStatus,
  deleteReport: exports.deleteReport,
  getReportAnalytics: exports.getReportAnalytics
};