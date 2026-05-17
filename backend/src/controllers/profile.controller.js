const Profile = require('../models/profile.model');

// GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/profile/me
const updateProfile = async (req, res) => {
  try {
    const { headline, targetRole, links, skills, projects, education, experience } = req.body;

    const updateData = {};
    if (headline) updateData.headline = headline;
    if (targetRole) updateData.targetRole = targetRole;
    if (links) updateData.links = links;
    if (skills) updateData.skills = skills;
    if (projects) updateData.projects = projects;
    if (education) updateData.education = education;
    if (experience) updateData.experience = experience;

    // Calculate completion percentage
    const fields = [headline, targetRole, skills?.length, projects?.length, education?.length, links?.github || links?.linkedin];
    const filled = fields.filter(Boolean).length;
    updateData.completionPercentage = Math.round((filled / fields.length) * 100);

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, upsert: true }
    );

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyProfile, updateProfile };