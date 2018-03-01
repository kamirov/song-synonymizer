'use strict'

const AbstractModel = use('App/Models/AbstractModel')

class TermRelation extends AbstractModel {

  static get KIND() {
    return {
      SYNONYM: 'synonym',
      ANTONYM: 'antonym',
      HYPERNYM: 'hypernym',
      HYPONYM: 'hyponym',
      HOLONYM: 'holonym',
      MERONYM: 'meronym',
      SIMILAR: 'similar',
      IMPLICATION: 'implication',
      OTHER: 'other',
    }
  }

  // A few kinds are grouped together for some synonym operations under the term 'similar'
  static get SIMILAR_KINDS() {
    return [
      TermRelation.KIND.SIMILAR,
      TermRelation.KIND.IMPLICATION,
      TermRelation.KIND.OTHER,
    ]
  }

}

module.exports = TermRelation
