'use strict'

const pluralize = require('pluralize');

const Logger = use('Logger');
const Database = use('Database');

const TermService = use('App/Services/TermService');
const Term = use('App/Models/Term');

class SynonymService {

  static get DEFAULT_FLAGS() {
    return {
      preserveTermSyllableCount: false,
      preserveLineSyllableCount: false,
      preserveTermRhyme: false,
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
  static get DISQUALIFIED_TERM() {
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
    // This gets most cases where a term from the original text had an unknown syllable count
    return 1;
  }

  static get MIN_LETTER_COUNT_TO_SYNONYMIZE() {
    return 3;
  }

  constructor() {
    this._termService = new TermService();
    this._flags = SynonymService.DEFAULT_FLAGS;
  }


  setFlags(flags) {
    // TODO: function should check to make sure only allowable flags are set
    this._flags = Object.assign({}, SynonymService.DEFAULT_FLAGS, flags);
  }

  /**
   * Main function
   * @param text
   * @returns {Promise<string>}
   */
  async processText(text) {
    // Tokenize, normalize, invalidate
    let tokens = this._termService.createNormalizedTokens(text);
    let tokensWithValidation = this._markupIgnoredTokens(tokens);

    return tokensWithValidation;

    // Fetch, Tag, Relate
    await this._getTermsOrFetch(tokens);

    return tokensWithRelations;

    // Synonymize
    let synonymizedTokens = await this._synonymize(tokensWithRelations);

    // Denormalize
    let tokenStates = tokensWithValidation.map(token => token.state);
    let denormalizedTokens = this._denormalize(synonymizedTokens, tokenStates);

    // Detokenize
    let synonymizedText = denormalizedTokens.map(token => token.name).join(' ');

    return synonymizedText;
  }

  /**
   * @param tokens
   * @private
   */
  _getTermsOrFetch(tokens) {



    return tokens;

  }

  /**
   * Adds ignored tag to tokens
   * @param tokens
   * @private
   */
  _markupIgnoredTokens(tokens) {
    console.log(tokens)
    return tokens.map(token => {
      return {
        ...token,
        ignored: this._shouldIgnoreToken(token.term, token.state.tags)
      }
    })
  }


  /**
   * Returns true if token is ignorable
   * @param term
   * @param tags
   * @returns {boolean}
   * @private
   */
  _shouldIgnoreToken(term, tags) {
    // TODO: Move to const
    const ignoredTags = ['Determiner', 'Pronoun', 'Contraction', 'Conjunction', 'Copula', 'Modal', 'Auxiliary', 'Negative'];

    if (tags.filter(tag => ignoredTags.includes(tag)).length
        || this._termService.isIgnoredTerm(term)
        || term.length < SynonymService.MIN_LETTER_COUNT_TO_SYNONYMIZE) {
      return true;
    }

    return false;
  }




  // BELOW POTENTIALLY DEPRECATED

  async osynonymize(text) {
    let lines = this._splitTextIntoLines(text);
    let linesPromises = lines.map(async line => {
      let tokens = this._splitLineIntoTokens(line);

      let tokenStates = [];
      let synonymPromises = tokens.map(async (token, tokenIdx) => {
        if (this._isPunctuation(token)) {
          let term = Object.assign({}, SynonymService.DISQUALIFIED_TERM, {
            name: token
          });

          tokenStates.push(SynonymService.DEFAULT_TOKEN_STATE);
          return term;
        }

        let {sanitizedToken, tokenState} = this._sanitizeToken(token);

        console.log(token, sanitizedToken, tokenState);

        // TODO: Don't like this repetition
        if (this._termService.isIgnoredTerm(sanitizedToken)
            || sanitizedToken.length < SynonymService.MIN_LETTER_COUNT_TO_SYNONYMIZE) {
          let term = Object.assign({}, SynonymService.DISQUALIFIED_TERM, {
            name: token
          });

          tokenStates.push(SynonymService.DEFAULT_TOKEN_STATE);
          return term;
        }

        tokenStates.push(tokenState);

        let isLastTerm = tokenIdx === (tokens.length-1)

        let term = await this._getTermAndSynonyms(sanitizedToken, isLastTerm);
        // console.log(sanitizedToken, tokenStates);
        return term;
      });

      let termsWithSynonyms = await Promise.all(synonymPromises);
      let unmodifiedReplacements = await this._replaceTermsWithSynonyms(termsWithSynonyms);
      // return unmodifiedReplacements;
      let replacements = this._applyOriginalTokenStateToTerms(unmodifiedReplacements, tokenStates);
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
      let nextTermStartsWithVowel = this._termService.isVowel(replacements[i+1].charAt(0));
      if (replacements[i] === 'a' && nextTermStartsWithVowel) {
        replacements[i] = 'an';
      } else if (replacements[i] === 'an' && !nextTermStartsWithVowel) {
        replacements[i] = 'a';
      }
    }
  }

  _applyOriginalTokenStateToTerms(unmodifiedReplacements, tokenStates) {
    return unmodifiedReplacements.map((termName, idx) => {
      let tokenState = tokenStates[idx];

      if (tokenState.plural) {
        termName = pluralize.plural(termName);
      }

      if (tokenState.contraction) {
        termName = termName + tokenState.contraction;
      }

      if (tokenState.capitalized) {
        termName = termName.charAt(0).toUpperCase() + termName.slice(1);
      }

      if (tokenState.punctuationBefore) {
        termName = tokenState.punctuationBefore + termName;
      }

      if (tokenState.punctuationAfter) {
        termName = termName + tokenState.punctuationAfter;
      }

      return termName;
    })
  }


  async _replaceTermsWithSynonyms(termsWithSynonyms) {

    // return termsWithSynonyms;

    let replacements;
    if (this._flags.preserveLineSyllableCount) {
      // TODO: Fill this in
      // Hard mode
      // let originalSyllableCount = termsWithSynonyms.reduce((runningCount, term) => {
      //   if (!term.name || this._isPunctuation(term.name)) {
      //     return runningCount
      //   } else {
      //     return runningCount + (term.syllablesCount || SynonymService.ASSUMED_SYLLABLE_COUNT)
      //   }
      // }, 0);
      //
      // console.log('originalSyllableCount', originalSyllableCount);

      replacements = termsWithSynonyms.map(term => term.name)
    } else {
      // Easy mode
      replacements = termsWithSynonyms.map(term => {
        if (!term.isDisqualified) {
          term = term.toJSON();
        }
        if (term.synonyms && term.synonyms.length) {
          let options = term.synonyms.slice();
          options.push({ name: term.name });
          return this._getRandomArrayElement(options).name;
        } else {
          return term.name;
        }
      })
    }

    // return termsWithSynonyms;
    return replacements
  }


  _getRandomArrayElement(array) {
    // TODO: Should move to an array helper class
    return array[Math.floor(Math.random()*array.length)];
  }


  async _getTermAndSynonyms(token, isLastTerm) {

    let termQuery = Term
      .query()
      .where('name', token)

    if (!this._isTermExcludedByClass(token)) {
      let synonymFilter = builder => {
        if (this._flags.preserveTermSyllableCount
          || (this._flags.preserveLineSyllableCount && isLastTerm)) {
          // TODO: Feels like there's a way to do this without a subquery
          let subquery = Database.select('syllablesCount')
            .from('terms')
            .where('name', token);

          builder.where('syllablesCount', subquery)
        }

        if (this._flags.preserveTermRhyme
          || (this._flags.preserveLineRhyme && isLastTerm)) {
          // TODO: Feels like there's a way to do this without a subquery
          let subquery = Database.select('ultima')
            .from('terms')
            .where('name', token);

          builder.where('ultima', subquery)
        }
      };

      termQuery.with('synonyms', synonymFilter);
    }

    return await termQuery.first();
  }


  _sanitizeToken(token) {

    let {term: uncontractedToken, contraction} = this._termService.uncontract(token);
    let depunctuatedToken = uncontractedToken.replace(TermService.PUNCTUATION_REGEX, '');
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


  _isTermExcludedByClass(term) {
    for (let flag in SynonymService.CLASS_FLAGS_AND_CHECKS) {
      let checkFunc = SynonymService.CLASS_FLAGS_AND_CHECKS[flag];
      if (this._flags[flag] && this._termService[checkFunc](term)) {
        return true;
      }
    }
  }
}

module.exports = SynonymService;
