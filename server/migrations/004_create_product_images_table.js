exports.up = function(knex) {
  return knex.schema.createTable('product_images', function(table) {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.string('image_url', 500).notNullable();
    table.string('alt_text', 255);
    table.integer('sort_order').defaultTo(0);
    table.boolean('is_primary').defaultTo(false);
    table.timestamps(true, true);
    
    // Foreign Keys
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    
    // Indexes
    table.index(['product_id']);
    table.index(['is_primary']);
    table.index(['sort_order']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('product_images');
};
