'use strict'

const Schema = use('Schema')

class TermRelationsSchema extends Schema {
  up () {
    this.create('termRelations', (table) => {
      table.increments()

      table.integer('termId')
      table.foreign('termId').references('terms.id');

      table.integer('relatedId')
      table.foreign('relatedId').references('terms.id');

      table.string('kind').notNullable()
    })
  }

  down () {
    this.drop('termRelations')
  }
}

module.exports = TermRelationsSchema
