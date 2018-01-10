'use strict'

const AbstractModel = use('App/Models/AbstractModel')

class User extends AbstractModel {

  // STUB
  // TODO: This seems to be needed to handle custom errors (might be an Adonis bug, but seems to go through the auth middleware, which can't be disabled)
}

module.exports = User
