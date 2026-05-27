const axios = require('axios');
const Profile = require('../models/profile.model');

const checkReadiness = async (req, res) => {
  try {
    const { jobDescription, jobTitle } = req.body;

    if (!jobDescription || jobDescription.trim().length < 10) {
      return res.json({
        success: true,
        data: {
          score: 50,
          verdict: 'Unknown',
          verdictColor: 'yellow',
          matchingSkills: [],
          missingSkills: [],
          explanation: 'No job description available to analyze.',
          totalJdSkills: 0,
          totalResumeSkills: 0
        }
      });
    }

    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Use resumeText if available, otherwise build from skills
    let resumeText = profile.resumeText || '';

    if (!resumeText && profile.skills && profile.skills.length > 0) {
      const skillNames = profile.skills.map(s => s.name).join(', ');
      resumeText = `Skills: ${skillNames}. Target role: ${profile.targetRole || ''}. ${profile.headline || ''}`;
    }

    if (!resumeText) {
      return res.json({
        success: true,
        data: {
          score: 0,
          verdict: 'Build First',
          verdictColor: 'red',
          matchingSkills: [],
          missingSkills: [],
          explanation: 'Please upload your resume or add skills to get a readiness score.',
          totalJdSkills: 0,
          totalResumeSkills: 0
        }
      });
    }

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/readiness/check`,
      {
        resumeText,
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