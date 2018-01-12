'use strict'

const pluralize = require('pluralize');
const kontractions = require('kontractions');

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
  static get DEFAULT_TOKEN_STATE() {
    return {
      plural: false,
      punctuationAfter: null,
      punctuationBefore: null,
      capitalized: false,
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

      console.log('tokens', tokens);

      let tokenStates = [];
      let synonymPromises = tokens.map(async (token, tokenIdx) => {
        if (this._isPunctuation(token)) {
          let word = Object.assign({}, SynonymService.DISQUALIFIED_WORD, {
            name: token
          });

          tokenStates.push(SynonymService.DEFAULT_TOKEN_STATE);
          return word;
        }

        let {sanitizedToken, tokenState} = this._sanitizeToken(token);
        tokenStates.push(tokenState);

        let isLastWord = tokenIdx === (tokens.length-1)

        let word = await this._getWordAndSynonyms(sanitizedToken, isLastWord);
        // console.log(sanitizedToken, tokenStates);
        return word;
      });

      let wordsWithSynonyms = await Promise.all(synonymPromises);
      let unmodifiedReplacements = await this._replaceWordsWithSynonyms(wordsWithSynonyms);
      // return unmodifiedReplacements;
      let replacements = this._applyOriginalTokenStateToWords(unmodifiedReplacements, tokenStates);

      return replacements;
      // return unmodifiedReplacements;
      // return replacements.join(' ');
    });

    return await Promise.all(linesPromises);
    // return (await Promise.all(linesPromises)).join('\n');
  }


  _applyOriginalTokenStateToWords(unmodifiedReplacements, tokenStates) {
    return unmodifiedReplacements.map((wordName, idx) => {
      let tokenState = tokenStates[idx];

      if (tokenState.plural) {
        wordName = pluralize.plural(wordName);
      }

      if (tokenState.capitalized) {
        wordName = wordName.charAt(0).toUpperCase() + wordName.slice(1);
      }

      wordName = tokenState.punctuationBefore + wordName + tokenState.punctuationAfter;

      return wordName;
    })
  }


  async _replaceWordsWithSynonyms(wordsWithSynonyms) {

    // return wordsWithSynonyms;

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

    let depunctuatedToken = token.replace(/[.,\/#!$%\^&\*\?;:{}'=\-_`~()\d]/g, '');

    let sanitizedToken =
      pluralize.singular(depunctuatedToken.toLowerCase());

    let tokenState = {
      plural: pluralize.isPlural(depunctuatedToken),
      punctuationAfter: token.substring(token.indexOf(depunctuatedToken) + depunctuatedToken.length),
      punctuationBefore: token.substring(0, token.indexOf(depunctuatedToken)),
      capitalized: this._startsWithCapital(depunctuatedToken)
    };

    return {
      sanitizedToken,
      tokenState
    }
  }


  _startsWithCapital(string) {
    // Credit to https://stackoverflow.com/a/46566773
    // TODO: Should go in a string helper
    return string.charCodeAt(0) >= 65 && string.charCodeAt(0) < 97;
  }

  _isPunctuation(string) {
    return string.replace(/[.,\/#!$%\^&\*\?;:{}=\-_`~()\d]/g, '').length === 0;
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
