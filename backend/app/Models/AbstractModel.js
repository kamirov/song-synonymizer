'use strict'

const Model = use('Model')

class AbstractModel extends Model {

  // Convention overwrites

  static get createdAtColumn () {
    return 'createdAt'
  }

  static get updatedAtColumn () {
    return 'updatedAt'
  }

}

module.exports = AbstractModel
