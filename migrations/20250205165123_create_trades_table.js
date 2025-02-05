/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('trades', (table) => {
    table.increments('id').primary();
    table.string('currency_pair', 10).notNullable();
    table.decimal('entry_price', 14, 2).notNullable();
    table.decimal('exit_price', 14, 2);
    table.enum('status', ['open', 'closed', 'pending']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());  
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('trades');
};
