'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');

const ExternalTermService = use('App/Services/ExternalTermService');
const TermService = use('App/Services/TermService');
const Term = use('App/Models/Term');

class TermStorageService {

  static get MAX_SYNONYM_DEPTH() { return 1; }


  constructor() {
    this._termService = new TermService;
    this.externalTermService = new ExternalTermService;
    this.newTerms = [];
  }


  async addNewTerms(text) {
    let tokens = this._termService.createNormalizedTokens(text);

    let potentialNewTerms = tokens
    .filter(token => token.term)
    .map(token => ({
      term: token.term,
      partOfSpeech: token.partOfSpeech
    }));

    for (let name of terms) {
      await this._addNewTermWithRelations(name);
    }

    return this.newTerms;
  }


  /**
   * Parses individual terms in a block of text. Depluralizes, removes duplicates, and unusable terms
   * @param text
   * @returns {string[]}
   */
  splitIntoUsableTerms(text) {
    let terms;

    // Lowercase
    text = text.toLowerCase();

    // Remove punctuation and split by space or new line
    terms = text.replace(TermService.PUNCTUATION_REGEX, '').split(/[ \n]/);

    // Depluralize
    terms = terms.map((term) => {
      return pluralize.singular(term);
    });

    // Remove duplicates
    terms = [...new Set(terms)];

    // Remove empty entries
    terms = terms.filter(term => term)

    // Remove terms with non-ascii characters
    // TODO: Should we really remove these?
    terms = terms.filter(term => !term.match(/[^\x00-\x7F]/g));

    // Uncontract
    terms = terms.map(term => this._termService.uncontract(term).term);

    // Remove ignored terms
    terms = terms.filter(term => !TermService.IGNORED_TERMS.includes(term));

    Logger.info('Parsed terms: ' + terms);

    return terms;
  }

  // Private methods

  async _addNewTermWithRelations(name) {
    let term = await Term.findBy('name', name);

    if (!term) {
      term = await this._addNewTerm(name);
    }

    // if (!term.hasCheckedSynonyms) {
    //   await this._recursivelyAddSynonyms(term);
    // }
  }

  async _addNewTerm(name) {
    return;
    let termParams = await this.externalTermService.getSummary(name);
    if (!termParams) {
      termParams = TermService.EMPTY_TERM_PARAMS;
      termParams.name = name;
    }

    this.newTerms.push(name);

    return await Term.create(termParams);
  }

  async _recursivelyAddSynonyms(term, currentDepth = 1) {
    let synonymNames = await this.externalTermService.getSynonyms(term.name);
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
        //   this._recursivelyAddSynonyms(term, currentDepth+1);
        // }
      }

      // TODO: Really don't like that this is done for each synonym. Should do this as a bulk operation
      await term.synonyms().attach(synonym.id);
    }

    term.hasCheckedSynonyms = true;
    await term.save();

  }

}

module.exports = TermStorageService;
