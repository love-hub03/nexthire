const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  headline: {
    type: String,
    maxlength: 120
  },
  targetRole: {
    type: String
  },
  skills: [{
    name: { type: String, required: true },
    category: { type: String },
    proficiencyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  }],
  projects: [{
    title: { type: String, required: true },
    description: { type: String },
    techStack: [String],
    liveUrl: { type: String },
    repoUrl: { type: String },
    isDeployed: { type: Boolean, default: false }
  }],
  education: [{
    institution: { type: String },
    degree: { type: String },
    field: { type: String },
    startYear: { type: Number },
    endYear: { type: Number }
  }],
  experience: [{
    company: { type: String },
    role: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrentRole: { type: Boolean, default: false },
    description: { type: String }
  }],
  links: {
    github: { type: String },
    linkedin: { type: String },
    portfolio: { type: String }
  },
  resumeUrl: { type: String },
  resumeText: { type: String },
  overallReadinessScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);