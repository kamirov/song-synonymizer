'use strict'

const Schema = use('Schema')


class WordSchema extends Schema {
  up () {
    this.create('words', (table) => {
      table.increments()
      table.timestamps()
      table.string('name')
      table.integer('syllablesCount')
      table.ultima('ultima')
    })
  }

  down () {
    this.drop('words')
  }
}

module.exports = WordSchema
