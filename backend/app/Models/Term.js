'use strict'

const AbstractModel = use('App/Models/AbstractModel')

class Term extends AbstractModel {

  related() {
    return this.belongsToMany('App/Models/Term', 'termId', 'relatedId').pivotTable('termRelations');
  }

}

module.exports = Term
