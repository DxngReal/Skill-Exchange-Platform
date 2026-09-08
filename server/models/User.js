const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  skillsTeach: [{
    name: { type: String, trim: true },
    category: { type: String, trim: true },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    description: { type: String, maxlength: 500, default: '' }
  }],
  skillsWant: [{
    name: { type: String, trim: true },
    category: { type: String, trim: true },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
  }],
  availability: {
    type: String,
    enum: ['weekdays', 'weekends', 'evenings', 'flexible', 'custom'],
    default: 'flexible'
  },
  location: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  resetToken: {
    type: String,
    select: false
  },
  resetTokenExpiry: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ 'skillsTeach.name': 'text', 'skillsTeach.category': 'text', name: 'text' });
userSchema.index({ 'skillsTeach.category': 1 });
userSchema.index({ 'skillsWant.name': 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
