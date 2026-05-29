const axios = require('axios');
const { scrapeInternshala } = require('../services/internshala.service');
const { scrapeWellfound } = require('../services/wellfound.service');
const getJobs = async (req, res) => {
  try {
    const { role, location = 'india', page = 1 } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a role to search for'
      });
    }

    // Fetch from all sources in parallel
    const [jsearchRes, remotiveRes, internshalaJobs, wellfoundJobs] = await Promise.allSettled([
      // JSearch - LinkedIn, Indeed, Glassdoor
      axios.get('https://jsearch.p.rapidapi.com/search', {
        params: {
          query: `${role} internship in ${location}`,
          page,
          num_pages:3 ,
          date_posted: 'month'
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
        }
      }),

      // Remotive - Free remote jobs
      axios.get('https://remotive.com/api/remote-jobs', {
        params: { search: role, limit:15}
      }),

      // Internshala - via Apify with smart caching
      scrapeInternshala(role),
      // Wellfound - via Apify with smart caching
      scrapeWellfound(role)
    ]);

    let jobs = [];

    // JSearch results
    if (jsearchRes.status === 'fulfilled') {
      const jsearchJobs = jsearchRes.value.data.data.map(job => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: job.job_city || job.job_country || 'India',
        description: job.job_description?.substring(0, 500) + '...',
        applyUrl: job.job_apply_link,
        postedAt: job.job_posted_at_datetime_utc,
        isRemote: job.job_is_remote,
        employmentType: job.job_employment_type,
        source: job.job_publisher || 'LinkedIn/Indeed',
        companyLogo: job.employer_logo || null
      }));
      jobs = [...jobs, ...jsearchJobs];
    }

    // Remotive results
    if (remotiveRes.status === 'fulfilled') {
      const remotiveJobs = remotiveRes.value.data.jobs.slice(0, 5).map(job => ({
        id: `remotive_${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        description: job.description?.replace(/<[^>]*>/g, '').substring(0, 500) + '...',
        applyUrl: job.url,
        postedAt: job.publication_date,
        isRemote: true,
        employmentType: job.job_type,
        source: 'Remotive',
        companyLogo: job.company_logo || null
      }));
      jobs = [...jobs, ...remotiveJobs];
    }

    // Internshala results
    if (internshalaJobs.status === 'fulfilled' && internshalaJobs.value.length > 0) {
      jobs = [...jobs, ...internshalaJobs.value];
    }
    // Wellfound results
    if (wellfoundJobs.status === 'fulfilled' && wellfoundJobs.value.length > 0) {
      jobs = [...jobs, ...wellfoundJobs.value];
    }
    res.json({
      success: true,
      count: jobs.length,
     sources: {
      jsearch: jsearchRes.status === 'fulfilled' ? jsearchRes.value.data.data.length : 0,
      remotive: remotiveRes.status === 'fulfilled' ? remotiveRes.value.data.jobs.slice(0, 5).length : 0,
      internshala: internshalaJobs.status === 'fulfilled' ? internshalaJobs.value.length : 0,
      wellfound: wellfoundJobs.status === 'fulfilled' ? wellfoundJobs.value.length : 0,
    },
      data: jobs
    });

  } catch (error) {
    console.error('JOB FETCH ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs };