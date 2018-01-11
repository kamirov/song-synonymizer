'use strict'

const pluralize = require('pluralize');

const Logger = use('Logger');
const Database = use('Database');

const WordService = use('App/Services/WordService');
const Word = use('App/Models/Word');

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
  static get DISQUALIFIED_WORD() {
    return {
      isDisqualified: true
    }
  }


  constructor() {
    this._wordService = new WordService();
    this._flags = SynonymService.DEFAULT_FLAGS;
  }


  setFlags(flags) {
    // TODO: function should check to make sure only allowable flags are set
    this._flags = Object.assign({}, SynonymService.DEFAULT_FLAGS, flags);
  }


  async synonymize(text) {
    let lines = this._splitTextIntoLines(text);
    let linesPromises = lines.map(async line => {
      let tokens = this._splitLineIntoTokens(line);

      console.log(tokens);

      let synonymPromises = tokens.map(async (token, tokenIdx) => {
        if (this._isPunctuation(token)) {
          return Object.assign({}, SynonymService.DISQUALIFIED_WORD, {
            name: token
          });
        }

        // Singularize and keep track of pluralization status
        let sanitizedToken = this._sanitizeToken(token);
        let tokenIsPlural = pluralize.isPlural(sanitizedToken);
        let singularToken = sanitizedToken;
        if (tokenIsPlural) {
          singularToken = pluralize.singular(sanitizedToken);
        }

        let isLastWord = tokenIdx === (tokens.length-1)
        let word = await this._getWordAndSynonyms(singularToken, isLastWord);

        return word;
      });

      let wordsWithSynonyms = await Promise.all(synonymPromises);

      let replacements = await this._replaceWordsWithSynonyms(wordsWithSynonyms);
      // return replacements;
      return replacements.join(' ');
    });

    // return await Promise.all(linesPromises);
    return (await Promise.all(linesPromises)).join('\n');
  }


  async _replaceWordsWithSynonyms(wordsWithSynonyms) {

    let replacements;
    if (this._flags.preserveLineSyllableCount) {
      // TODO: Fill in
    } else {
      // Easy mode
      replacements = wordsWithSynonyms.map(word => {
        if (!word.isDisqualified) {
          word = word.toJSON();
        }
        if (word.synonyms && word.synonyms.length) {
          return this._getRandomArrayElement(word.synonyms).name;
        } else {
          return word.name;
        }
      })
    }

    // return wordsWithSynonyms;
    return replacements
  }


  _getRandomArrayElement(array) {
    // TODO: Should move to an array helper class
    return array[Math.floor(Math.random()*array.length)];
  }


  async _getWordAndSynonyms(token, isLastWord) {

    let wordQuery = Word
      .query()
      .where('name', token)

    if (!this._isWordExcludedByClass(token)) {
      let synonymFilter = builder => {
        if (this._flags.preserveWordSyllableCount
          || (this._flags.preserveLineSyllableCount && isLastWord)) {
          // TODO: Feels like there's a way to do this without a subquery
          let subquery = Database.select('syllablesCount')
            .from('words')
            .where('name', token);

          builder.where('syllablesCount', subquery)
        }

        if (this._flags.preserveWordRhyme
          || (this._flags.preserveLineRhyme && isLastWord)) {
          // TODO: Feels like there's a way to do this without a subquery
          let subquery = Database.select('ultima')
            .from('words')
            .where('name', token);

          builder.where('ultima', subquery)
        }
      };

      wordQuery.with('synonyms', synonymFilter);
    }

    return await wordQuery.first();
  }


  _sanitizeToken(token) {
    return token.replace(/[.,\/#!$%\^&\*\?;:{}=\-_`~()\d]/g, '');
  }


  _isPunctuation(token) {
    return token.replace(/[.,\/#!$%\^&\*\?;:{}=\-_`~()\d]/g, '').length === 0;
  }


  _splitTextIntoLines(text) {
    return text.split('\n');
  }


  _splitLineIntoTokens(line) {
    return line.split(/[ \n]/);
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
