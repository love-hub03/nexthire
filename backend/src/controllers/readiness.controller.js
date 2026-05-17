const axios = require('axios');
const Profile = require('../models/profile.model');

// POST /api/readiness/check
const checkReadiness = async (req, res) => {
  try {
    const { jobDescription, jobTitle } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description'
      });
    }

    // Get user profile
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile || !profile.resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume first'
      });
    }

    // Call Python AI service
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/readiness/check`,
      {
        resumeText: profile.resumeText,
        jobDescription,
        jobTitle: jobTitle || ''
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('READINESS ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { checkReadiness };