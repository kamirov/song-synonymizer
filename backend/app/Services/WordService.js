'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');
const Word = use('App/Models/Word');

class WordService {

  static get EMPTY_WORD_PARAMS() {
    return {
      hasCheckedSynonyms: true,
      isEmpty: true
    }
  }

  static get IPA_VOWELS() {
    return [
      'i', 'y', 'ɨ', 'ʉ', 'ɯ', 'u', 'ɪ', 'ʏ', 'ɪ̈', 'ʊ̈', 'ʊ', 'e', 'ø', 'ɘ', 'ɵ', 'ɤ', 'o', 'e̞', 'ø̞', 'ə', 'ɤ̞',
      'o̞', 'ɛ', 'œ', 'ɜ', 'ɞ', 'ʌ', 'ɔ', 'æ', 'ɐ', 'a', 'ɶ', 'ä', 'ɑ', 'ɒ'
    ];
  }
  static get PRONOUNS() {
    return [
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'what', 'who',
      'it', 'whom',
      'mine', 'yours', 'his', 'hers', 'ours', 'theirs',
      'this', 'that', 'these', 'those',
      'which', 'whose', 'whoever', 'whatever', 'whichever', 'whomever',
      'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'
    ];
  }
  static get CONJUNCTIONS() {
    // Only coordinating conjunctions
    return [
      'for', 'and', 'nor', 'but', 'or', 'yet', 'so'
    ];
  }
  static get ARTICLES() {
    return [
      'the', 'an', 'a'
    ];
  }
  static get CONTRACTIONS() {
    return [
      "n't", "'s", "'m", "'re", "'ve", "'d", "'ll"
    ]
  }
  static get IGNORED_WORDS() {
    // TODO: Should probably put these in a DB table
    return [
    ]
  }


  isPronoun(word) {
    return WordService.PRONOUNS.includes(word);
  }


  isConjunction(word) {
    return WordService.CONJUNCTIONS.includes(word);
  }


  isArticle(word) {
    return WordService.ARTICLES.includes(word);
  }


  async getWord(name) {
    return await Word
      .query()
      .where('name', name)
      .with('synonyms')
      .fetch();
  }


  /**
   * Gets ultima from an IPA representation of a word
   * (almost...this doesn't include the first 1-2 consonants of the ultima, so that might be a misnomer)
   *
   * @param {string} ipa
   * @returns {string}
   */
  getUltima(ipa) {

    let ultima = '';
    let encounteredVowel = false;
    for (let i = ipa.length-1; i >= 0; i--) {
      if (WordService.IPA_VOWELS.includes(ipa.charAt(i))) {
        ultima = ipa.charAt(i) + ultima;
        encounteredVowel = true;
      } else if (encounteredVowel) {
        break;
      } else {
        ultima = ipa.charAt(i) + ultima;
      }
    }

    return ultima;
  }
}

module.exports = WordService;
