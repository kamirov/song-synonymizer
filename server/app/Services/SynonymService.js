'use strict'

import pluralize from 'pluralize';

const WordService = use('App/Services/WordService');

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
      let token = this._splitLineIntoTokens(line);

      tokens.map((token, tokenIdx) => {
        if (this._isPunctuation(token)) {
          return token;
        }

        let tokenIsPluralized = pluralize.isPluralized(token);
        if (tokenIsPluralized) {
          token = pluralize.singular(token);
        }

        if (this._isWordExcludedByClass(token)) {
          return token;
        }

        // TODO: Get syn using model (use a scope to limit by syllables if preserveWordSyllableCount)
        // TODO: When getting syn, should scope by preserveWordSyllableCount, preserveWordRhyme, and (if last word and !preserveWordRhyme) by preserveLineRhyme
        // TODO: This scope should also order by random
        let synonym = null; // tmp

        let replacement = synonym || token;

        // TODO: Need to add functionality for preserveLineRhyme
        if (tokenIsPluralized) {
          replacement = pluralize.plural(replacement);
        }

        return replacement;
      });
    });
  }

  _isPunctuation(token) {

  }

  _splitTextIntoLines(text) {

  }

  _splitLineIntoTokens(line) {

  }

  _isWordExcludedByClass(word) {
    for (flag in SynonymService.CLASS_FLAGS_AND_CHECKS) {
      let checkFunc = SynonymService.CLASS_FLAGS_AND_CHECKS[flag];
      if (this._flags[flag] && this._wordService[checkFunc](word)) {
        return true;
      }
    }
  }
}

module.exports = SynonymService;
