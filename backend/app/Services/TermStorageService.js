'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');

const ExternalTermService = use('App/Services/ExternalTermService');
const TermService = use('App/Services/TermService');
const Term = use('App/Models/Term');

class TermStorageService {

  static get MAX_SYNONYM_DEPTH() { return 1; }


  constructor() {
    this._wordService = new TermService;
    this.externalTermService = new ExternalTermService;
    this.newTerms = [];
  }


  async addNewTerms(text) {
    let tokens = this._wordService.createNormalizedTokens(text);

    let potentialNewTerms = tokens
    .filter(token => token.term)
    .map(token => ({
      term: token.term,
      partOfSpeech: token.partOfSpeech
    }));

    return potentialNewTerms;
    for (let name of words) {
      await this._addNewTermWithSynonyms(name);
    }

    return this.newTerms;
  }


  /**
   * Parses individual words in a block of text. Depluralizes, removes duplicates, and unusable words
   * @param text
   * @returns {string[]}
   */
  splitIntoUsableTerms(text) {
    let words;

    // Lowercase
    text = text.toLowerCase();

    // Remove punctuation and split by space or new line
    words = text.replace(TermService.PUNCTUATION_REGEX, '').split(/[ \n]/);

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

    // Uncontract
    words = words.map(word => this._wordService.uncontract(word).word);

    // Remove ignored words
    words = words.filter(word => !TermService.IGNORED_WORDS.includes(word));

    Logger.info('Parsed words: ' + words);

    return words;
  }

  // Private methods

  async _addNewTermWithSynonyms(name) {
    let word = await Term.findBy('name', name);

    if (!word) {
      word = await this._addNewTerm(name);
    }

    // if (!word.hasCheckedSynonyms) {
    //   await this._recursivelyAddSynonyms(word);
    // }
  }

  async _addNewTerm(name) {
    return;
    let wordParams = await this.externalTermService.getSummary(name);
    if (!wordParams) {
      wordParams = TermService.EMPTY_WORD_PARAMS;
      wordParams.name = name;
    }

    this.newTerms.push(name);

    return await Term.create(wordParams);
  }

  async _recursivelyAddSynonyms(word, currentDepth = 1) {
    let synonymNames = await this.externalTermService.getSynonyms(word.name);
    Logger.info(synonymNames);

    for (let synonymName of synonymNames) {
    // synonymNames.forEach(async synonymName => {
      if (synonymName.includes('/')) {
        continue;
      }
      let synonym = await Term.findBy('name', synonymName);
      if (!synonym) {
        synonym = await this._addNewTerm(synonymName);

        // if (currentDepth < TermStorageService.MAX_SYNONYM_DEPTH) {
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

module.exports = TermStorageService;
