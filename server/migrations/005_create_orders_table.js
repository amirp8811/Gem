exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.increments('id').primary();
    table.string('order_number', 50).notNullable().unique();
    table.integer('user_id').unsigned();
    table.string('customer_email', 255).notNullable();
    table.string('customer_phone', 20);
    table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).defaultTo('pending');
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('shipping_amount', 10, 2).defaultTo(0);
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('payment_method', 50);
    table.string('payment_status', 50).defaultTo('pending');
    table.string('payment_id', 255); // Stripe payment intent ID
    table.json('billing_address').notNullable();
    table.json('shipping_address').notNullable();
    table.text('notes');
    table.timestamp('shipped_at');
    table.timestamp('delivered_at');
    table.timestamps(true, true);
    
    // Foreign Keys
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index(['order_number']);
    table.index(['user_id']);
    table.index(['status']);
    table.index(['customer_email']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
