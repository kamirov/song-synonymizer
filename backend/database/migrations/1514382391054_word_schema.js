'use strict'

const Schema = use('Schema')


class WordSchema extends Schema {
  up () {
    this.create('words', (table) => {
      table.increments()
      table.string('name')
      table.integer('syllablesCount')
      table.string('ultima')
      table.timestamps()
    })
  }

  down () {
    this.drop('words')
  }
}

module.exports = WordSchema
