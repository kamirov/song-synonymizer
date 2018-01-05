'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');

const ExternalWordService = use('App/Services/ExternalWordService');
const WordService = use('App/Services/WordService');
const Word = use('App/Models/Word');

class WordStorageService {

  static get MAX_SYNONYM_DEPTH() { return 1; }

  constructor() {
    this.wordService = new WordService;
    this.externalWordService = new ExternalWordService;
  }

  async addNewWords(text) {
    let words = this.splitIntoUsableWords(text);

    words.forEach(async name => {
      this._addNewWordWithSynonyms(name);
    });
  }

  async _addNewWordWithSynonyms(name) {

    let word = await Word.findBy('name', name);
    console.log(word);

    if (!word) {
      await this._addNewWord(name);
      await this._recursivelyAddSynonyms(name);
    }
  }

  async _addNewWord(name) {
    let summary = await this.externalWordService.getSummary(name);
    await Word.create(summary);
  }

  async _recursivelyAddSynonyms(name, currentDepth = 1) {
    let synonymNames = await this.externalWordService.getSynonyms(name);
    synonymNames.forEach(async synonymName => {

      let synonym = await Word.findBy('name', synonymName);
      if (!synonym) {
        await this._addNewWord(synonymName);

        // if (currentDepth < WordStorageService.MAX_SYNONYM_DEPTH) {
        //   this._recursivelyAddSynonyms(word, currentDepth+1);
        // }
      }

      // TODO: Add synonym relationship
    })
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

module.exports = WordStorageService;
