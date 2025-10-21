exports.up = function(knex) {
  return knex.schema.createTable('site_settings', function(table) {
    table.increments('id').primary();
    table.string('key', 100).notNullable().unique();
    table.text('value');
    table.string('type', 50).defaultTo('text'); // text, json, boolean, number
    table.string('group', 50).defaultTo('general'); // general, appearance, email, etc.
    table.text('description');
    table.boolean('is_public').defaultTo(false); // Can be accessed by frontend
    table.timestamps(true, true);
    
    // Indexes
    table.index(['key']);
    table.index(['group']);
    table.index(['is_public']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('site_settings');
};
