exports.up = function(knex) {
  return knex.schema.createTable('cart_items', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned();
    table.string('session_id', 255); // For guest users
    table.integer('product_id').unsigned().notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamps(true, true);
    
    // Foreign Keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    
    // Indexes
    table.index(['user_id']);
    table.index(['session_id']);
    table.index(['product_id']);
    
    // Unique constraint to prevent duplicate items
    table.unique(['user_id', 'product_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('cart_items');
};
