const { ApifyClient } = require('apify-client');
const JobCache = require('../models/jobCache.model');
const logger = { 
  info: console.log, 
  error: console.error 
};

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const scrapeInternshala = async (role) => {
  const query = role.toLowerCase().trim();

  // Check cache first
  const cached = await JobCache.findOne({
    query,
    source: 'internshala',
    expiresAt: { $gt: new Date() }
  });

  if (cached) {
    logger.info(`Internshala cache hit for: ${query}`);
    return cached.jobs;
  }

  logger.info(`Internshala cache miss — calling Apify for: ${query}`);

  try {
    // Map role to Internshala category
    const categoryMap = {
      'frontend': 'web-development',
      'react': 'web-development',
      'backend': 'web-development',
      'fullstack': 'web-development',
      'full stack': 'web-development',
      'mern': 'web-development',
      'node': 'web-development',
      'python': 'python',
      'data science': 'data-science',
      'machine learning': 'machine-learning',
      'android': 'android',
      'ios': 'ios',
      'flutter': 'android',
      'devops': 'cloud-computing',
      'ui ux': 'graphic-design',
      'java': 'java',
      'php': 'php',
    };

    // Find best matching category
    let category = 'web-development';
    for (const [key, val] of Object.entries(categoryMap)) {
      if (query.includes(key)) {
        category = val;
        break;
      }
    }

    const run = await client.actor('logiover/internshala-scraper').call({
      listingType: 'internships',
      categories: [category],
      maxResults: 35,
      scrapeDetails: false,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const jobs = items.map(item => ({
      id: `internshala_${item.id || Math.random().toString(36).substr(2, 9)}`,
      title: item.title || item.role || 'Internship',
      company: item.company || item.companyName || 'Company',
      location: item.location || item.city || 'India',
      description: item.description || item.about || `${item.title} internship opportunity`,
      applyUrl: item.url || item.applyUrl || 'https://internshala.com',
      stipend: item.stipend || item.salary || 'Not specified',
      duration: item.duration || '',
      skills: item.skills || item.requiredSkills || [],
      postedAt: item.postedAt || item.datePosted || '',
      isRemote: item.workFromHome || item.remote || false,
      source: 'Internshala',
    }));

    // Save to cache
    await JobCache.findOneAndUpdate(
      { query, source: 'internshala' },
      {
        query,
        source: 'internshala',
        jobs,
        cachedAt: new Date(),
       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    logger.info(`Internshala: ${jobs.length} jobs scraped and cached for: ${query}`);
    return jobs;

  } catch (error) {
    logger.error(`Internshala scraping failed: ${error.message}`);
    return [];
  }
};

module.exports = { scrapeInternshala };