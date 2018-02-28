'use strict'

const AbstractModel = use('App/Models/AbstractModel')

class TermRelation extends AbstractModel {

  static get KIND_SYNONYM() { return 'synonym' }
  static get KIND_ANTONYM() { return 'antonym' }
  static get KIND_HYPERNYM() { return 'hypernym' }
  static get KIND_HYPONYM() { return 'hyponym' }
  static get KIND_HOLONYM() { return 'holonym' }
  static get KIND_MERONYM() { return 'meronym' }
  static get KIND_SIMILAR() { return 'similar' }
  static get KIND_IMPLICATION() { return 'implication' }
  static get KIND_OTHER() { return 'other' }

  // A few kinds are grouped together for some synonym operations under the term 'similar'
  static get SIMILAR_KINDS() {
    return [
      TermRelation.KIND_SIMILAR,
      TermRelation.KIND_IMPLICATION,
      TermRelation.KIND_OTHER,
    ]
  }

}

module.exports = TermRelation
