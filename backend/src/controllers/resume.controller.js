const Profile = require('../models/profile.model');

// POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Extract text using pdfjslib
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

    // Save resume text to profile
    await Profile.findOneAndUpdate(
      { user: req.user._id },
      { resumeText },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        wordCount: resumeText.split(' ').length,
        preview: resumeText.substring(0, 300) + '...'
      }
    });
  } catch (error) {
    console.error('RESUME UPLOAD ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume };