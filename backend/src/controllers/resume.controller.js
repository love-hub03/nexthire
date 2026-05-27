const Profile = require('../models/profile.model');
const axios = require('axios');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Extract text from PDF
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const uint8Array = new Uint8Array(req.file.buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDoc = await loadingTask.promise;

    let resumeText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      resumeText += strings.join(' ') + '\n';
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF'
      });
    }

    // Call Python AI service to extract skills
    let extractedSkills = [];
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/resume/parse`,
        { text: resumeText }
      );
      if (aiResponse.data?.data?.skills) {
        extractedSkills = aiResponse.data.data.skills.map(s => ({
          name: s.name,
          displayName: s.displayName || s.name,
          category: s.category || 'other',
          proficiencyLevel: 'intermediate',
          verifiedFromResume: true
        }));
      }
    } catch (aiErr) {
      console.error('AI skill extraction failed:', aiErr.message);
    }

    // Save resume text and extracted skills to profile
    await Profile.findOneAndUpdate(
      { user: req.user._id },
      {
        resumeText,
        ...(extractedSkills.length > 0 && { skills: extractedSkills })
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded and skills extracted successfully',
      data: {
        wordCount: resumeText.split(' ').length,
        skillsExtracted: extractedSkills.length,
        skills: extractedSkills.map(s => s.name),
        preview: resumeText.substring(0, 300) + '...'
      }
    });
  } catch (error) {
    console.error('RESUME UPLOAD ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume };