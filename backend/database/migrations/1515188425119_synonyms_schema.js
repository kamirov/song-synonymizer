'use strict'

const Schema = use('Schema')

class SynonymsSchema extends Schema {
  up () {
    this.create('synonyms', (table) => {
      table.increments()
      table.integer('wordId')
      table.foreign('wordId').references('words.id');
      table.integer('synonymId')
      table.foreign('synonymId').references('words.id');
      table.unique(['wordId', 'synonymId']);
    })
  }

  down () {
    this.drop('synonyms')
  }
}

module.exports = SynonymsSchema
