'use strict'

const Schema = use('Schema')

class SynonymizationSchema extends Schema {
  up () {
    this.create('synonymizations', (table) => {
      table.increments();
      table.string('hash');
      table.string('original');
      table.string('synonymized');
    })
  }

  down () {
    this.drop('synonymizations')
  }
}

module.exports = SynonymizationSchema
