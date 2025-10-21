const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Delete existing admin users
  await knex('users').where('role', 'admin').del();

  // Hash the admin password
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Gravity2024!@#', 12);

  // Insert admin user
  await knex('users').insert([
    {
      id: 1,
      email: process.env.ADMIN_EMAIL || 'admin@gravity-jewelry.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      email_verified: true,
      email_verified_at: new Date(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log('✅ Admin user created successfully');
  console.log(`📧 Email: ${process.env.ADMIN_EMAIL || 'admin@gravity-jewelry.com'}`);
  console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Gravity2024!@#'}`);
};
