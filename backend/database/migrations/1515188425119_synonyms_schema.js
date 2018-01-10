'use strict'

const Schema = use('Schema')

class SynonymsSchema extends Schema {
  up () {
    this.create('synonyms', (table) => {
      table.increments()
      table.string('wordId')
      table.string('synonymId')
    })
  }

  down () {
    this.drop('synonyms')
  }
}

module.exports = SynonymsSchema
