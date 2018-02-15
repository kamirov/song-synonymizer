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
      preservePronouns: true,
      preserveArticles: true,
      preserveConjunctions: true,
      preservePrepositions: true,
    }
  }
  static get ALLOWABLE_FLAGS() {
    return Object.keys(SynonymService.DEFAULT_FLAGS);
  }
  static get CLASS_FLAGS_AND_CHECKS() {
    return {
      preservePronouns: 'isPronoun',
      preserveArticles: 'isArticle',
      preserveConjunctions: 'isConjunction',
      preservePrepositions: 'isPreposition'
    };
  }
  static get DISQUALIFIED_WORD() {
    return {
      isDisqualified: true
    }
  }
  static get DEFAULT_TOKEN_STATE() {
    return {
      contraction: null,
      plural: false,
      punctuationAfter: null,
      punctuationBefore: null,
      capitalized: false,
    }
  }
  static get ASSUMED_SYLLABLE_COUNT() {
    // This gets most cases where a word from the original text had an unknown syllable count
    return 1;
  }

  static get MIN_LETTER_COUNT_TO_SYNONYMIZE() {
    return 4;
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

        // console.log(token, sanitizedToken, tokenState);

        // TODO: Don't like this repetition
        if (this._wordService.isIgnoredWord(sanitizedToken)
            || sanitizedToken.length < SynonymService.MIN_LETTER_COUNT_TO_SYNONYMIZE) {
          let word = Object.assign({}, SynonymService.DISQUALIFIED_WORD, {
            name: token
          });

          tokenStates.push(SynonymService.DEFAULT_TOKEN_STATE);
          return word;
        }

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
      this._correctArticles(replacements);

      // return replacements;
      // return unmodifiedReplacements;
      return replacements.join(' ');
    });

    // return await Promise.all(linesPromises);
    return (await Promise.all(linesPromises)).join('\n');
  }

  _correctArticles(replacements) {
    for (let i = 0; i < replacements.length-1; i++) {
      let nextWordStartsWithVowel = this._wordService.isVowel(replacements[i+1].charAt(0));
      if (replacements[i] === 'a' && nextWordStartsWithVowel) {
        replacements[i] = 'an';
      } else if (replacements[i] === 'an' && !nextWordStartsWithVowel) {
        replacements[i] = 'a';
      }
    }
  }

  _applyOriginalTokenStateToWords(unmodifiedReplacements, tokenStates) {
    return unmodifiedReplacements.map((wordName, idx) => {
      let tokenState = tokenStates[idx];

      if (tokenState.plural) {
        wordName = pluralize.plural(wordName);
      }

      if (tokenState.contraction) {
        wordName = wordName + tokenState.contraction;
      }

      if (tokenState.capitalized) {
        wordName = wordName.charAt(0).toUpperCase() + wordName.slice(1);
      }

      if (tokenState.punctuationBefore) {
        wordName = tokenState.punctuationBefore + wordName;
      }

      if (tokenState.punctuationAfter) {
        wordName = wordName + tokenState.punctuationAfter;
      }

      return wordName;
    })
  }


  async _replaceWordsWithSynonyms(wordsWithSynonyms) {

    // return wordsWithSynonyms;

    let replacements;
    if (this._flags.preserveLineSyllableCount) {
      // TODO: Fill this in
      // Hard mode
      // let originalSyllableCount = wordsWithSynonyms.reduce((runningCount, word) => {
      //   if (!word.name || this._isPunctuation(word.name)) {
      //     return runningCount
      //   } else {
      //     return runningCount + (word.syllablesCount || SynonymService.ASSUMED_SYLLABLE_COUNT)
      //   }
      // }, 0);
      //
      // console.log('originalSyllableCount', originalSyllableCount);

      replacements = wordsWithSynonyms.map(word => word.name)
    } else {
      // Easy mode
      replacements = wordsWithSynonyms.map(word => {
        if (!word.isDisqualified) {
          word = word.toJSON();
        }
        if (word.synonyms && word.synonyms.length) {
          let options = word.synonyms.slice();
          options.push({ name: word.name });
          return this._getRandomArrayElement(options).name;
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

    let {word: uncontractedToken, contraction} = this._wordService.uncontract(token);
    let depunctuatedToken = uncontractedToken.replace(WordService.PUNCTUATION_REGEX, '');
    let sanitizedToken = pluralize.singular(depunctuatedToken.toLowerCase());

    let tokenState = {
      contraction: contraction,
      plural: pluralize.isPlural(depunctuatedToken),
      punctuationAfter: uncontractedToken.substring(uncontractedToken.indexOf(depunctuatedToken) + depunctuatedToken.length),
      punctuationBefore: uncontractedToken.substring(0, uncontractedToken.indexOf(depunctuatedToken)),
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
    return line.trim().split(/[ \n]/);
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
