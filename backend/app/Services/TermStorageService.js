'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');
const syllable = require('syllable');

const ExternalTermService = use('App/Services/ExternalTermService');
const TermService = use('App/Services/TermService');
const Term = use('App/Models/Term');
const TermRelation = use('App/Models/TermRelation');

class TermStorageService {

  constructor() {
    this._termService = new TermService;
    this.externalTermService = new ExternalTermService;
    this.newTerms = [];
  }

  async addNewTerms(text) {
    let tokens = this._termService.createNormalizedTokens(text);

    let potentialNewTerms = tokens
    .filter(token => token.name);

    for (let term of potentialNewTerms) {
      await this._addTermIfNewWithRelations(term.name);
    }

    return this.newTerms;
  }

  // Private methods

  async _addTermIfNewWithRelations(name) {
    console.log(name);
    let term = await Term.findBy('name', name);

    if (!term) {
      await this._addNewTerm(name, true);
    } else if (!term.relationsQueried) {
      await this._addRelations(name);
    }
  }

  /**
   * Adds relations to existing words
   * TODO: This is an ugly function. I see 3 areas of improvement:
   *  1) It queries the Words API for relation names even though we already have the word
   *  2) Can be somewhat combined with _addNewTerm()
   *  3) Get rid of the double relatedTerm instantiation
   * @param name
   * @returns {Promise<void>}
   * @private
   */
  async _addRelations(name) {
    // console.log(name);
    let externalTerm = await this.externalTermService.getTerm(name);

    if (externalTerm) {

      // We could have multiple pos, which we treat as separate terms
      for (let pos in externalTerm) {
        let mainTerm = await Term.query().where({
          name: name,
          partOfSpeech: pos
        }).first();

        for (let kind of Object.values(TermRelation.KIND)) {
          let termNames = externalTerm[pos][kind];

          if (!termNames.length) {
            continue;
          }

          for (let termName of termNames) {
            // Don't like that we have to do this extra get here, but unsure of how to get around it
            let relatedTerm = await Term.query().where({
              name: termName,
              partOfSpeech: pos
            }).first();

            if (!relatedTerm) {
              await this._addNewTerm(termName, false);
            }

            relatedTerm = await Term.query().where({
              name: termName,
              partOfSpeech: pos
            }).first();

            // Relate the two
            await mainTerm.relations().attach(relatedTerm.id, row => {
              row.kind = kind;
            });
          }
        }

        mainTerm.relationsQueried = true;
        await mainTerm.save();
      }
    }
  }

  /**
   * Adds new terms from the Words API. Can potentially load in multiple terms (same term name, different pos)
   * @param name
   * @param shouldAddRelations
   * @returns {Promise<void>}
   * @private
   */
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

              // Relate the two
              await mainTerm.relations().attach(relatedTerm.id, row => {
                row.kind = kind;
              });
            }
          }
        }
      }
    } else {
      let termParams = TermService.EMPTY_TERM_PARAMS;
      termParams.name = name;
      termParams.syllablesCount = syllable(name); // TODO: This should be done in the external service (or otherwise in some middle service)
      await Term.create(termParams);
    }
  }
}

module.exports = TermStorageService;
