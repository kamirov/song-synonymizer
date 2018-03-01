'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');

const ExternalTermService = use('App/Services/ExternalTermService');
const TermService = use('App/Services/TermService');
const Term = use('App/Models/Term');
const TermRelation = use('App/Models/TermRelation');

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
    .filter(token => token.term);

    for (let term of potentialNewTerms) {
      await this._addTermIfNewWithRelations(term.term);
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

  async _addTermIfNewWithRelations(name) {
    let term = await Term.findBy('name', name);

    if (!term) {
      term = await this._addNewTerm(name, true);
    }

    // if (!term.hasCheckedSynonyms) {
    //   await this._recursivelyAddSynonyms(term);
    // }
  }

  async _addNewTerm(name, shouldAddRelations = false) {
    // console.log(name);
    let externalTerm = await this.externalTermService.getTerm(name);

    this.newTerms.push(name);

    if (externalTerm) {
      // console.log('externalTerm', externalTerm)
      // We could have multiple pos, which we treat as separate terms
      for (let pos in externalTerm) {
        let termParams = {
          name: name,
          partOfSpeech: pos,
          syllablesCount: externalTerm[pos].syllablesCount,
          ultima: externalTerm[pos].ultima,
          relationsQueried: shouldAddRelations
        };
        let mainTerm = await Term.create(termParams);

        if (shouldAddRelations) {

          for (let kind of Object.values(TermRelation.KIND)) {
            let termNames = externalTerm[pos][kind];

            if (!termNames.length) {
              continue;
            }

            for (let termName of termNames) {
              await this._addNewTerm(termName, false);

              // Don't like that we have to do this extra get here, but unsure of how to get around it
              let relatedTerm = await Term.query().where({
                name: termName,
                partOfSpeech: pos
              }).first();

              console.log(termName, pos, relatedTerm);

              // Relate the two
              await mainTerm.relations().attach(relatedTerm.id, row => {
                row.kind = kind;
              });
            }
          }



        } else {

        }
      }
    } else {
      let termParams = TermService.EMPTY_TERM_PARAMS;
      termParams.name = name;
      await Term.create(termParams);
    }

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
