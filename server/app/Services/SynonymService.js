'use strict'

const pluralize = require('pluralize');
const WordService = require('App/Services/WordService');

class SynonymService {

  static get DEFAULT_FLAGS() {
    return {
      preserveWordSyllableCount: false,
      preserveLineSyllableCount: false,
      preserveWordRhyme: false,
      preserveLineRhyme: false,
      preservePronouns: false,
      preserveArticles: false,
      preserveConjunctions: false
    }
  }
  static get ALLOWABLE_FLAGS() {
    return Object.keys(SynonymService.DEFAULT_FLAGS);
  }
  static get CLASS_FLAGS_AND_CHECKS() {
    return {
      preservePronouns: 'isPronoun',
      preserveArticles: 'isArticle',
      preserveConjunctions: 'isConjunction'
    };
  }


  constructor() {
    this._wordService = new WordService();
    this._flags = SynonymService.DEFAULT_FLAGS;
  }


  setFlags(flags) {
    // TODO: function should check to make sure only allowable flags are set
    this._flags = Object.assign({}, SynonymService.DEFAULT_FLAGS, flags);
  }

  synonymizeText(text) {
    let lines = this._splitTextIntoLines(text);

    lines.forEach(line => {
      let tokens = this._splitLineIntoTokens(line);

      let replacementsList = tokens.forEach((token, tokenIdx) => {
        if (this._isPunctuation(token)) {
          return;
        }

        let tokenIsPluralized = pluralize.isPluralized(token);
        let singularToken = token;
        if (tokenIsPluralized) {
          singularToken = pluralize.singular(token);
        }

        if (this._isWordExcludedByClass(singularToken)) {
          return [token]; // TODO: Get word using model, format as {name, syllablesCount}
        }

        // TODO: Get syn using model (use a scope to limit by syllables if preserveWordSyllableCount)
        // TODO: When getting syn, should scope by preserveWordSyllableCount, preserveWordRhyme, and (if last word and !preserveWordRhyme) by preserveLineRhyme*
        // TODO: synonyms should be array of {name, syllablesCount}
        let synonyms = []; // tmp

        if (synonyms.length) {
          if (tokenIsPluralized) {
            return synonyms.map(synonym => pluralize.plural(synonym));
          } else {
            return synonyms;
          }
        } else {
          return [token]; // TODO: Get word using model, format as {name, syllablesCount}
        }
      });
    });
  }

  _isPunctuation(token) {
    // TODO: Some regex check
  }

  _splitTextIntoLines(text) {

  }

  _splitLineIntoTokens(line) {

  }

  _isWordExcludedByClass(word) {
    for (let flag in SynonymService.CLASS_FLAGS_AND_CHECKS) {
      let checkFunc = SynonymService.CLASS_FLAGS_AND_CHECKS[flag];
      if (this._flags[flag] && this._wordService[checkFunc](word)) {
        return true;
      }
    }
  }
}

module.exports = SynonymService;
