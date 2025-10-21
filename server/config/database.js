const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    if ((process.env.NODE_ENV || 'development') === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing without DB connection (development mode). Some routes may be unavailable.');
    }
  });

module.exports = db;
