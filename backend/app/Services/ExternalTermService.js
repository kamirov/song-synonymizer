'use strict'

const fetch = require('node-fetch');
const syllable = require('syllable');

const Redis = use('Redis')
const Env = use('Env');
const Logger = use('Logger');

const TermService = use('App/Services/TermService');
const TermRelation = use('App/Models/TermRelation');

/**
 * Words API wrapper service
 */
class ExternalTermService {

  // API Constants
  static get API_ENDPOINTS() {
    return {
      summary: ExternalTermService.API_ROOT + ':word',
      synonyms: ExternalTermService.API_ROOT + ':word/synonyms'
    }
  }

  // See https://www.wordsapi.com/pricing
  static get DAILY_API_CALLS_LIMIT() { return 2500 }
  static get DAY_IN_MILLISECONDS() { return 1000 * 60 * 60 * 24 }

  static get API_ROOT() { return 'https://wordsapiv1.p.mashape.com/words/' }

  // Request constants
  static get REQUEST_HEADERS() {
    return {
      'accept': 'application/json',
      'X-Mashape-Key': Env.get('X_MASHAPE_KEY')
    }
  }
  static get REQUEST_GET_CONFIG() {
    return {
      method: 'get',
      headers: ExternalTermService.REQUEST_HEADERS
    }
  }

  static get DEFAULT_TERM_SUMMARY() {
    return {
      ultima: null,
      syllablesCount: null,
      // TODO: Loop this
      [TermRelation.KIND.SYNONYM]: [],
      [TermRelation.KIND.ANTONYM]: [],
      [TermRelation.KIND.HYPERNYM]: [],
      [TermRelation.KIND.HYPONYM]: [],
      [TermRelation.KIND.HOLONYM]: [],
      [TermRelation.KIND.MERONYM]: [],
      [TermRelation.KIND.SIMILAR]: [],
      [TermRelation.KIND.IMPLICATION]: [],
      [TermRelation.KIND.OTHER]: [],
    }
  }

  // Mapping of our fields to Words API fields
  static get RELATIONS_FIELDS_MAP() {
    return {
      [TermRelation.KIND.SYNONYM]: 'synonyms',
      [TermRelation.KIND.ANTONYM]: 'antonyms',
      [TermRelation.KIND.HYPERNYM]: 'typeOf',
      [TermRelation.KIND.HYPONYM]: 'hasTypes',
      [TermRelation.KIND.HOLONYM]: 'partOf',
      [TermRelation.KIND.MERONYM]: 'hasParts',
      [TermRelation.KIND.SIMILAR]: 'similarTo',
      [TermRelation.KIND.IMPLICATION]: 'entails',
      [TermRelation.KIND.OTHER]: 'also',
    }
  }

  constructor() {
    this._termService = new TermService;
  }

  /**
   * Fetches term from the Words API
   * @param {string} name
   * @returns {Promise<Object>}
   */
  async getTerm(name) {

    let response = await this._fetch(
      ExternalTermService.API_ENDPOINTS.summary.replace(':word', name),
      ExternalTermService.REQUEST_GET_CONFIG);

    return this._parseSummary(await response.json());
  }

  /**
   * Parses relevant summary information
   * @param {object} summaryResponse
   * @returns {null|object}
   * @private
   */
  _parseSummary(summaryResponse) {

    if (('success' in summaryResponse && summaryResponse.success === false)
        || !summaryResponse.results) {
      return;
    }

    let relations = {};

    // Add pos containers and relations
    summaryResponse.results.forEach(result => {
      let pos = result.partOfSpeech;

      if (!relations[pos]) {
        relations[pos] = ExternalTermService.DEFAULT_TERM_SUMMARY;
      }

      // Add relations
      for (let relationType in ExternalTermService.RELATIONS_FIELDS_MAP) {
        let externalField = ExternalTermService.RELATIONS_FIELDS_MAP[relationType];
        if (result[externalField] && result[externalField].length) {
          relations[pos][relationType] = relations[pos][relationType].concat(result[externalField]);
        }
      }
    })

    // Pronunciations and syllables
    for (let pos in relations) {

      if (summaryResponse.pronunciation) {
        // Some words have a pos-based pronunciation, some entries in the Words API are incomplete
        let ipa = summaryResponse.pronunciation[pos]
          || summaryResponse.pronunciation.all
          || summaryResponse.pronunciation;
        relations[pos].ultima = this._termService.getUltima(ipa);
      } else {
        // TODO: Use an external service to get an IPA, then extract the ultima
        relations[pos].ultima = null;
      }

      if (summaryResponse.syllables && summaryResponse.syllables.count) {
        relations[pos].syllablesCount = summaryResponse.syllables.count
      } else {
        relations[pos].syllablesCount = syllable(summaryResponse.word);
      }
    }

    return relations;
  }


  async _fetch(endpoint, config) {
    Logger.info('About to make an API call to:', endpoint);
    // await this._updateApiCallsCount();
    return await fetch(endpoint, config);
  }


  /**
   * Check whether we've made too many calls to the API today
   * @private
   */
  async _updateApiCallsCount() {
    let remainingApiCallsCount = parseInt(await Redis.get('remainingApiCallsCount'));

    if (remainingApiCallsCount > 0) {
      await Redis.set(
        'remainingApiCallsCount',
        remainingApiCallsCount-1,
        'EX',
        ExternalTermService.DAY_IN_MILLISECONDS);

    } else if (remainingApiCallsCount === 0) {
      throw Error("Exceeded daily Words API limit");

    } else {
      await Redis.set(
        'remainingApiCallsCount',
        ExternalTermService.DAILY_API_CALLS_LIMIT,
        'EX',
        ExternalTermService.DAY_IN_MILLISECONDS);
    }

    let remainingCallsCount = await Redis.get('remainingApiCallsCount');
    Logger.info('Remaining API calls:', remainingCallsCount)

  }


  _getTimeToMidnight() {
    // TODO: Probably belongs in a helper class
    let now = new Date();
    let midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()+1,
      0,0,0);

    return Math.floor((midnight - now) / 1000);   // convert to s
  }

}

module.exports = ExternalTermService;
