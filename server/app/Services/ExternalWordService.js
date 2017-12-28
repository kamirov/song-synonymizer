'use strict'

const Env = use('Env');
const fetch = require('node-fetch');

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

  async getSummary(word) {
    let response = await fetch(
      ExternalWordService.API_ENDPOINTS.summary.replace(':word', word),
      ExternalWordService.REQUEST_GET_CONFIG);

    return await response.json()
  }

  async getSynonyms(word) {
    let response = await fetch(
      ExternalWordService.API_ENDPOINTS.synonyms.replace(':word', word),
      ExternalWordService.REQUEST_GET_CONFIG);

    return await response.json()
  }
}

module.exports = ExternalWordService;
