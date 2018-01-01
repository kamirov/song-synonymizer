'use strict'

const pluralize = require('pluralize');
const Logger = use('Logger');
const ExternalWordService = use('App/Services/ExternalWordService');
const Word = use('App/Models/Word');

class WordService {

  static get IPA_VOWELS() {
    return [
      'i', 'y', 'ɨ', 'ʉ', 'ɯ', 'u', 'ɪ', 'ʏ', 'ɪ̈', 'ʊ̈', 'ʊ', 'e', 'ø', 'ɘ', 'ɵ', 'ɤ', 'o', 'e̞', 'ø̞', 'ə', 'ɤ̞',
      'o̞', 'ɛ', 'œ', 'ɜ', 'ɞ', 'ʌ', 'ɔ', 'æ', 'ɐ', 'a', 'ɶ', 'ä', 'ɑ', 'ɒ'
    ];
  }
  static get PRONOUNS() {
    return [
      'I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
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

  static get MAX_SYNONYM_DEPTH() { return 1; }

  constructor() {
    this.externalWordService = new ExternalWordService;
  }

  async addNewWords(text) {
    let words = this.splitIntoUsableWords(text);

    words.forEach(async name => {
      this._addNewWordWithSynonyms(name);
    });
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

  async _addNewWordWithSynonyms(word) {
    let wordInDatabase = false; //tmp, replace with model get
    if (!wordInDatabase) {
      await this._addNewWord(name);
      this._recursivelyAddSynonyms(name);
    }
  }

  async _addNewWord(word) {
    let summary = await this.externalWordService.getSummary(word);
    let ultima = this.getUltima(summary.ultima);

    let wordParams = Object.assign({}, summary, {
      ultima
    });

    await Word.create(wordParams);
  }

  async _recursivelyAddSynonyms(word, currentDepth = 1) {
    let synonyms = await this.externalWordService.getSynonyms(word);

    synonyms.forEach(async synonym => {
      let synonymInDatabase = false; // tmp, replace with model get
      if (!synonymInDatabase) {
        await this._addNewWord(word);

        if (currentDepth < WordService.MAX_SYNONYM_DEPTH) {
          this._recursivelyAddSynonyms(word, currentDepth+1);
        }
      }



      // TODO: Add synonym relationship
    })
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


  /**
   * Parses individual words in a block of text. Depluralizes, removes duplicates, and unusable words
   * @param text
   * @returns {string[]}
   */
  splitIntoUsableWords(text) {
    let words;

    // Remove punctuation and split by space or new line
    words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\d]/g, '').split(/[ \n]/);

    // Depluralize
    words = words.map((word) => {
      return pluralize.singular(word);
    });

    // Remove duplicates
    words = [...new Set(words)];

    // Remove empty entries
    words = words.filter(word => word)

    // Remove words with non-ascii characters
    // TODO: Should we really remove these?
    words = words.filter(word => !word.match(/[^\x00-\x7F]/g));

    // Remove words with punctuation
    // TODO: Should we really remove these?
    words = words.filter(word => !word.match(/['"]/g));

    Logger.info('Parsed words: ' + words);

    return words;
  }

}

module.exports = WordService;
