const mysql = require('mysql2/promise');
const knex = require('knex');
const knexConfig = require('../knexfile');
require('dotenv').config();

async function setupDatabase() {
  const dbName = process.env.DB_NAME || 'gravity_jewelry';
  
  // Create connection without database to create the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created or already exists`);

    // Close the connection
    await connection.end();

    // Now run migrations
    const environment = process.env.NODE_ENV || 'development';
    const config = knexConfig[environment];
    const db = knex(config);

    console.log('🔄 Running database migrations...');
    await db.migrate.latest();
    console.log('✅ Database migrations completed');

    // Close the knex connection
    await db.destroy();

    console.log('🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Copy .env.example to .env and configure your settings');
    console.log('2. Run: npm run seed-db (to populate with sample data)');
    console.log('3. Run: npm run dev (to start the development server)');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
