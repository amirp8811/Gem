exports.up = function(knex) {
  return knex.schema.createTable('order_items', function(table) {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable();
    table.integer('product_id').unsigned().notNullable();
    table.string('product_name', 255).notNullable(); // Store name at time of order
    table.string('product_sku', 100);
    table.decimal('unit_price', 10, 2).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.json('product_snapshot'); // Store product details at time of order
    table.timestamps(true, true);
    
    // Foreign Keys
    table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');
    
    // Indexes
    table.index(['order_id']);
    table.index(['product_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('order_items');
};
