'use strict'

const Schema = use('Schema')

class TermRelationsSchema extends Schema {
  up () {
    this.create('termRelations', (table) => {
      table.increments()

      table.integer('term1Id')
      table.foreign('term1Id').references('terms.id');

      table.integer('term2Id')
      table.foreign('term2Id').references('terms.id');

      table.string('kind').notNullable()

      // TODO: Need a unique constraint, but it needs to function
      // regardless of term order (this can be done with knex.raw and min/max funcs)
      // table.unique(['term1Id', 'term2Id']);
    })
  }

  down () {
    // this.drop('termRelations')
  }
}

module.exports = TermRelationsSchema
