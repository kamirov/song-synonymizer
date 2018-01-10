'use strict'

const AbstractModel = use('App/Models/AbstractModel')

class Word extends AbstractModel {

  synonyms() {
    return this.belongsToMany('App/Models/Word')
  }

}

module.exports = Word
