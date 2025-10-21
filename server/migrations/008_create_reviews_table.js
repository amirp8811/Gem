exports.up = function(knex) {
  return knex.schema.createTable('reviews', function(table) {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.integer('user_id').unsigned();
    table.string('customer_name', 100).notNullable();
    table.string('customer_email', 255).notNullable();
    table.integer('rating').notNullable(); // 1-5 stars
    table.string('title', 255);
    table.text('comment');
    table.boolean('is_verified_purchase').defaultTo(false);
    table.boolean('is_approved').defaultTo(false);
    table.timestamp('approved_at');
    table.timestamps(true, true);
    
    // Foreign Keys
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index(['product_id']);
    table.index(['user_id']);
    table.index(['rating']);
    table.index(['is_approved']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reviews');
};
