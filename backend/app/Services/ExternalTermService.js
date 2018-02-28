'use strict'

const fetch = require('node-fetch');

const Redis = use('Redis')
const Env = use('Env');
const Logger = use('Logger');

const TermService = use('App/Services/TermService');

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

  constructor() {
    this._termService = new TermService;
  }

  /**
   * Fetches summary from the Words API
   * @param {string} name
   * @returns {Promise<Object>}
   */
  async getSummary(name) {

    let response = await this._fetch(
      ExternalTermService.API_ENDPOINTS.summary.replace(':word', name),
      ExternalTermService.REQUEST_GET_CONFIG);

    return;
    return this._parseSummary(await response.json());
  }



  /**
   * Fetches synonyms from the Words API
   * @param {string} word
   * @returns {Promise<string[]>}
   */
  async getSynonyms(word) {

    let response = await this._fetch(
      ExternalTermService.API_ENDPOINTS.synonyms.replace(':word', word),
      ExternalTermService.REQUEST_GET_CONFIG);

    return this._parseSynonyms(await response.json())
  }


  /**
   * Parses relevant summary information
   * @param {object} summaryResponse
   * @returns {null|object}
   * @private
   */
  _parseSummary(summaryResponse) {

    if ('success' in summaryResponse && summaryResponse.success === false) {
      return;
    }

    let summary = {
      name: null,
      syllablesCount: null,
      ultima: null
    };

    summary = Object.assign({}, summary, {
      name: summaryResponse.word,
      syllablesCount: (summaryResponse.syllables ? summaryResponse.syllables.count : null),
    });

    if (summaryResponse.pronunciation) {
      let ipa = summaryResponse.pronunciation.all || summaryResponse.pronunciation;
      summary.ultima = this._termService.getUltima(ipa);
    }

    return summary;
  }


  /**
   * Parses relevant synonyms information
   * @param synonymsResponse
   * @returns {string[]}
   * @private
   */

  _parseSynonyms(synonymsResponse) {
    // Pretty simple right now, but wanted to have a consistent get/parse pattern for each Words API endpoint
    let synonyms = synonymsResponse.synonyms;
    return synonyms;
  }


  async _fetch(endpoint, config) {
    Logger.info('About to make an API call to:', endpoint);
    await this._updateApiCallsCount();
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
