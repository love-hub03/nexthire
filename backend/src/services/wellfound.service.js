const { ApifyClient } = require('apify-client');
const JobCache = require('../models/jobCache.model');

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const scrapeWellfound = async (role) => {
  const query = role.toLowerCase().trim();

  // Check cache first
  const cached = await JobCache.findOne({
    query,
    source: 'wellfound',
    expiresAt: { $gt: new Date() }
  });

  if (cached) {
    console.log(`Wellfound cache hit for: ${query}`);
    return cached.jobs;
  }

  console.log(`Wellfound cache miss — calling Apify for: ${query}`);

  try {
    const run = await client.actor('crawlerbros/wellfound-scraper').call({
      startUrls: [{ url: 'https://wellfound.com/jobs' }],
      keyword: role,
      maxResults: 35,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const jobs = items.map(item => ({
      id: `wellfound_${item.id || Math.random().toString(36).substr(2, 9)}`,
      title: item.title || item.jobTitle || 'Job Opening',
      company: item.company || item.companyName || 'Startup',
      location: item.location || item.jobLocation || 'Remote',
      description: item.description || item.jobDescription ||
        `${item.title} opportunity at ${item.company}. ${item.compensation || ''}`,
      applyUrl: item.url || item.jobUrl || 'https://wellfound.com/jobs',
      stipend: item.compensation || item.salary || '',
      postedAt: item.postedAt || '',
      isRemote: item.remote || item.isRemote || false,
      employmentType: item.jobType || 'Full-time',
      source: 'Wellfound',
      companyLogo: item.companyLogo || null
    }));

    // Save to cache
    await JobCache.findOneAndUpdate(
      { query, source: 'wellfound' },
      {
        query,
        source: 'wellfound',
        jobs,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    console.log(`Wellfound: ${jobs.length} jobs scraped and cached for: ${query}`);
    return jobs;

  } catch (error) {
    console.error(`Wellfound scraping failed: ${error.message}`);
    return [];
  }
};

module.exports = { scrapeWellfound };