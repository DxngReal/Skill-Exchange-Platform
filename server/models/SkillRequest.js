const mongoose = require('mongoose');

const skillRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillListing',
    required: true
  },
  skillName: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  exchangeDetails: {
    format: { type: String, enum: ['online', 'in-person', 'both'], default: 'online' },
    scheduledDate: { type: Date },
    notes: { type: String, maxlength: 500, default: '' }
  }
}, {
  timestamps: true
});

skillRequestSchema.index({ requester: 1 });
skillRequestSchema.index({ provider: 1 });
skillRequestSchema.index({ status: 1 });

module.exports = mongoose.model('SkillRequest', skillRequestSchema);
