const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: "https://nexthire-kq8q996t7-loveprojects.vercel.app",
  credentials: true
}));;
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { success: false, message: 'Too many requests, try again later' }
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'NextHire API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/resume', require('./routes/resume.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/readiness', require('./routes/readiness.routes'));
app.use('/api/roadmap', require('./routes/roadmap.routes'));

module.exports = app;