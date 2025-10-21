exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('slug', 255).notNullable().unique();
    table.text('description');
    table.text('short_description');
    table.decimal('price', 10, 2).notNullable();
    table.decimal('compare_price', 10, 2); // For sale prices
    table.string('sku', 100).unique();
    table.integer('stock_quantity').defaultTo(0);
    table.boolean('track_inventory').defaultTo(true);
    table.integer('category_id').unsigned();
    table.string('material', 100); // Gold, Silver, etc.
    table.string('gemstone', 100); // Diamond, Pearl, etc.
    table.decimal('weight', 8, 2); // In grams
    table.string('dimensions', 100); // Size information
    table.json('specifications'); // Additional specs as JSON
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('views_count').defaultTo(0);
    table.decimal('rating_average', 3, 2).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    table.timestamps(true, true);
    
    // Foreign Keys
    table.foreign('category_id').references('id').inTable('categories').onDelete('SET NULL');
    
    // Indexes
    table.index(['slug']);
    table.index(['category_id']);
    table.index(['is_active']);
    table.index(['is_featured']);
    table.index(['price']);
    table.index(['material']);
    table.index(['gemstone']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
