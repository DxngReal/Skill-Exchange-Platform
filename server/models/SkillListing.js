const mongoose = require('mongoose');

const skillListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillName: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'programming', 'design', 'business', 'marketing',
      'music', 'languages', 'fitness', 'cooking',
      'photography', 'writing', 'data-science', 'devops',
      'mobile-development', 'web-development', 'other'
    ]
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  teachingFormat: {
    type: String,
    enum: ['online', 'in-person', 'both'],
    default: 'both'
  },
  availability: {
    type: String,
    enum: ['weekdays', 'weekends', 'evenings', 'flexible', 'custom'],
    default: 'flexible'
  },
  whatToExpect: {
    type: String,
    maxlength: 1500,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  interestedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

skillListingSchema.index({ skillName: 'text', description: 'text', tags: 'text' });
skillListingSchema.index({ category: 1 });
skillListingSchema.index({ experienceLevel: 1 });
skillListingSchema.index({ user: 1 });

module.exports = mongoose.model('SkillListing', skillListingSchema);
