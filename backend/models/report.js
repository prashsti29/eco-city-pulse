const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['heat', 'water', 'vegetation', 'pollution', 'infrastructure', 'other'] 
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'resolved', 'rejected'], 
    default: 'pending' 
  },
  images: [{ type: String }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  officialNotes: { type: String }
}, { timestamps: true });

reportSchema.index({ 'location.lat': 1, 'location.lng': 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);