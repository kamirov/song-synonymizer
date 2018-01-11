'use strict'

const Schema = use('Schema')


class WordSchema extends Schema {
  up () {
    this.create('words', (table) => {
      table.increments()

      table.string('name').notNullable()
      table.unique('name');

      table.integer('syllablesCount').unsigned()
      table.string('ultima')
      table.boolean('hasCheckedSynonyms').default(false)
      table.boolean('isEmpty').default(false);
      table.timestamp('createdAt');
      table.timestamp('updatedAt');
    })
  }

  down () {
    this.drop('words')
  }
}

module.exports = WordSchema
