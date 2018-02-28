'use strict'

const Schema = use('Schema')


class TermSchema extends Schema {
  up () {
    this.create('terms', (table) => {
      table.increments()

      table.string('name').notNullable()
      table.string('partOfSpeech')
      table.integer('syllablesCount').unsigned()
      table.string('ultima')
      table.boolean('relationsQueried').default(false)
      table.boolean('isEmpty').default(false)
      table.timestamp('createdAt')
      table.timestamp('updatedAt')

      table.unique(['name', 'partOfSpeech']);
    })
  }

  down () {
    this.drop('terms')
  }
}

module.exports = TermSchema
