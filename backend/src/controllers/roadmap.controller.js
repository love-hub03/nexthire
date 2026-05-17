const axios = require('axios');
const Profile = require('../models/profile.model');

// POST /api/roadmap/generate
const generateRoadmap = async (req, res) => {
  try {
    const { targetRole, missingSkills, timeframe } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a target role'
      });
    }

    // Get user profile skills
    const profile = await Profile.findOne({ user: req.user._id });
    const currentSkills = profile?.skills?.map(s => s.name) || [];

    // Call Python AI service
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/roadmap/generate`,
      {
        targetRole,
        missingSkills: missingSkills || [],
        currentSkills,
        timeframe: timeframe || '3 months'
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('ROADMAP ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateRoadmap };