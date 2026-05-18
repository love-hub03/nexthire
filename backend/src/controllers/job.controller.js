const axios = require('axios');

// GET /api/jobs?role=frontend developer&location=india
const getJobs = async (req, res) => {
  try {
    const { role, location = 'india', page = 1 } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a role to search for'
      });
    }

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: `${role} internship in ${location}`,
        page: page,
        num_pages: 1,
        date_posted: 'month'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
      }
    });

   const jobs = response.data.data.map(job => ({
  id: job.job_id,
  title: job.job_title,
  company: job.employer_name,
  location: job.job_city || job.job_country,
  description: job.job_description?.substring(0, 500) + '...',
  applyUrl: job.job_apply_link,
  postedAt: job.job_posted_at_datetime_utc,
  isRemote: job.job_is_remote,
  employmentType: job.job_employment_type,
  source: job.job_publisher || 'Job Board',
  companyLogo: job.employer_logo || null
}));
    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('JOB FETCH ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs };