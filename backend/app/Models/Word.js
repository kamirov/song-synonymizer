'use strict'

const AbstractModel = use('App/Models/AbstractModel')

class Word extends AbstractModel {

  synonyms() {
    return this.belongsToMany('App/Models/Word', 'wordId', 'synonymId').pivotTable('synonyms');
  }

}

module.exports = Word
