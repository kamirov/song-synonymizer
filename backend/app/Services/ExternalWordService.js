'use strict'

const fetch = require('node-fetch');

const Env = use('Env');
const WordService = use('App/Services/WordService');

/**
 * Words API wrapper service
 */
class ExternalWordService {

  // API Constants
  static get API_ENDPOINTS() {
    return {
      summary: ExternalWordService.API_ROOT + ':word',
      synonyms: ExternalWordService.API_ROOT + ':word/synonyms'
    }
  }
  // TODO: Confirm this
  static get DAILY_API_CALLS_LIMIT() { return 5000 }
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
      headers: ExternalWordService.REQUEST_HEADERS
    }
  }

  constructor() {
    this.wordService = new WordService;
    this._checkApiLimit();
  }

  /**
   * Fetches summary from the Words API
   * @param {string} name
   * @returns {Promise<Object>}
   */
  async getSummary(name) {
    let response = await fetch(
      ExternalWordService.API_ENDPOINTS.summary.replace(':word', name),
      ExternalWordService.REQUEST_GET_CONFIG);

    return this._parseSummary(await response.json());
  }



  /**
   * Fetches synonyms from the Words API
   * @param {string} word
   * @returns {Promise<string[]>}
   */
  async getSynonyms(word) {
    let response = await fetch(
      ExternalWordService.API_ENDPOINTS.synonyms.replace(':word', word),
      ExternalWordService.REQUEST_GET_CONFIG);

    return this._parseSynonyms(await response.json())
  }


  /**
   * Parses relevant summary information
   * @param {object} summaryResponse
   * @returns {object}
   * @private
   */
  _parseSummary(summaryResponse) {
    console.log('response', summaryResponse);

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
      summary.ultima = this.wordService.getUltima(ipa);
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


  /**
   * Check whether we've made too many calls to the API today
   * @private
   */
  _checkApiLimit() {
    let apiCallsCount = 0;  // TODO: Fill this (probably Redis)

    if (apiCallsCount >= ExternalWordService.DAILY_API_CALLS_LIMIT) {
      throw "Reached API calls limit";
    }
  }
}

module.exports = ExternalWordService;
