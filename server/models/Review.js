const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillRequest',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  skillName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ request: 1 });
reviewSchema.index({ reviewer: 1 });

// Prevent duplicate reviews
reviewSchema.index({ reviewer: 1, request: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
