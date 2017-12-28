'use strict'

const Env = use('Env');

/**
 * Words API wrapper service
 */
class ExternalWordService {

  static get API_ENDPOINTS() {
    return {
      summary: ExternalWordService.API_ROOT + ':word',
      synonyms: ExternalWordService.API_ROOT + ':word/synonyms'
    }
  }
  static get DAILY_API_CALLS_LIMIT() { return 5000 }
  static get API_ROOT() { return 'https://wordsapiv1.p.mashape.com/words/' }
  static get API_REQUEST_HEADERS() {
    return {
      'accept': 'application/json',
      'X-Mashape-Key': Env.get('X_MASHAPE_KEY')
    }
  }

  getSummary(word) {

  }

  getSynonyms(word) {

  }
}

module.exports = ExternalWordService;
