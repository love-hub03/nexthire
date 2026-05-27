const mongoose = require('mongoose');

const jobCacheSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  source: {
    type: String,
    required: true
  },
  jobs: [{
    id: String,
    title: String,
    company: String,
    location: String,
    description: String,
    applyUrl: String,
    stipend: String,
    duration: String,
    skills: [String],
    postedAt: String,
    isRemote: Boolean,
    source: String,
  }],
  cachedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
});

// Auto delete expired cache
jobCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast lookup
jobCacheSchema.index({ query: 1, source: 1 });

module.exports = mongoose.model('JobCache', jobCacheSchema);