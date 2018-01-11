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
    this.newWords = [];
  }


  async addNewWords(text) {
    let words = this.splitIntoUsableWords(text);
    for (let name of words) {
      await this._addNewWordWithSynonyms(name);
    }

    return this.newWords;
  }


  /**
   * Parses individual words in a block of text. Depluralizes, removes duplicates, and unusable words
   * @param text
   * @returns {string[]}
   */
  splitIntoUsableWords(text) {
    let words;

    // Lowercase
    text = text.toLowerCase();

    // Remove punctuation and split by space or new line
    words = text.replace(/[.,\/#!$%\^&\*\?;:{}=\-_`~()\d]/g, '').split(/[ \n]/);

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


  // Private methods

  async _addNewWordWithSynonyms(name) {

    let word = await Word.findBy('name', name);

    if (!word) {
      word = await this._addNewWord(name);
    }

    if (!word.hasCheckedSynonyms) {
      await this._recursivelyAddSynonyms(word);
    }
  }

  async _addNewWord(name) {
    let wordParams = await this.externalWordService.getSummary(name);
    if (!wordParams) {
      wordParams = WordService.EMPTY_WORD_PARAMS;
      wordParams.name = name;
    }

    this.newWords.push(name);

    return await Word.create(wordParams);
  }

  async _recursivelyAddSynonyms(word, currentDepth = 1) {
    let synonymNames = await this.externalWordService.getSynonyms(word.name);
    Logger.info(synonymNames);

    for (let synonymName of synonymNames) {
      let synonym = await Word.findBy('name', synonymName);
      if (!synonym) {
        synonym = await this._addNewWord(synonymName);

        // if (currentDepth < WordStorageService.MAX_SYNONYM_DEPTH) {
        //   this._recursivelyAddSynonyms(word, currentDepth+1);
        // }
      }

      // TODO: Really don't like that this is done for each synonym. Should do this as a bulk operation
      await word.synonyms().attach(synonym.id);
    }

    word.hasCheckedSynonyms = true;
    await word.save();

  }

}

module.exports = WordStorageService;
