'use strict'

const pluralize = require('pluralize');

const Logger = use('Logger');
const Database = use('Database');

const TermService = use('App/Services/TermService');
const Term = use('App/Models/Term');
const TermRelation = use('App/Models/TermRelation');

class SynonymService {

  static get DEFAULT_FLAGS() {
    return {
      preserveTermSyllableCount: false,
      preserveLineSyllableCount: false,
      preserveTermRhyme: false,
      preserveLineRhyme: false,

      includeSynonyms: true,
      includeAntonyms: true,
      includeHypernyms: true,
      includeHyponyms: true,
      includeHolonyms: true,
      includeMeronyms: true,
      includeSimilars: true,

      // Deprecated
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

    // Synonymize
    let tokensWithRelations = await this._addTermAndReplacements(tokensWithValidation);
    let tokensWithSynonymization = await this._addSynonymization(tokensWithRelations);

    // Denormalize
    let denormalizedTermNames = this._denormalizeTokens(tokensWithSynonymization);

    return denormalizedTermNames;

    // Correct
    let correctedNames = this._correctTermNames(denormalizedTermNames);

    // Detokenizes
    let synonymizedText = denormalizedTokens.map(token => token.name).join(' ');

    return synonymizedText;
  }

  _correctTermNames(termNames) {
    let correctedTermNames = termNames.slice()

    // For now just the articles (maybe add more corrections later)
    correctedTermNames = _correctArticles(termNames);

    return correctedTermNames;
  }

  async _denormalizeTokens(tokens) {
    return tokens.map(token => {

      let name = token.name;

      if (token.state.tags.includes('Plural')) {
        // Can probably do this with the NLP package as well
        name = pluralize.plural(name);
      }

      if (token.state.tags.includes('TitleCase')) {
        name = name[0].toUpperCase() + name.slice(1);
      }

      if (token.state.tags.includes('Acronym')) {
        name = name.toUpperCase();
      }

      // TODO: denormalize verbs
      // if (token.state.tags.includes(''))

      if (token.state.prefix) {
        name = token.state.prefix + token.name;
      }

      if (token.state.suffix) {
        name += token.state.suffix;
      }

      return name
    })
  }

  async _addSynonymization(tokens) {

    if (this._flags.preserveLineSyllableCount) {

      // Get original syllable count
      let originalSyllableCount = tokens.reduce((runningCount, token) => {
        return runningCount + token.syllablesCount;
      }, 0);
      console.log('originalSyllableCount', originalSyllableCount)

      // Get all synonym groupings that meet the syllable count
      // TODO

    } else {
      return tokens.map((token, tokenIdx) => {
        let synonymization;
        if (token.ignored || token.replacements.length === 0) {
          synonymization = token.name;
        } else {
          synonymization = this._getRandomArrayElement(token.replacements).name;
        }

        return {
          ...token,
          synonymization: synonymization,
        }
      })

      // token.synonymization =
      //
      // // Easy mode
      // replacements = termsWithSynonyms.map(term => {
      //   if (!term.isDisqualified) {
      //     term = term.toJSON();
      //   }
      //   if (term.synonyms && term.synonyms.length) {
      //     let options = term.synonyms.slice();
      //     options.push({ name: term.name });
      //     return this._getRandomArrayElement(options).name;
      //   } else {
      //     return term.name;
      //   }
      // })
    }


    return tokens;
  }

  async _addTermAndReplacements(tokens) {

    let synonymPromises = tokens.map(async (token, tokenIdx) => {

      let isLast = tokenIdx === (tokens.length-1);

      console.log('-----------');
      console.log(token);

      let termWithSynonyms = (await this._getTermAndSynonyms(token, isLast)).toJSON();
      // console.log(termWithSynonyms);
      // Add main term elements to token
      token.syllablesCount = termWithSynonyms.syllablesCount;
      token.ultima = termWithSynonyms.ultima;

      token.replacements = termWithSynonyms.relations.map(replacement => ({
        name: replacement.
          name,
        syllablesCount: replacement.syllablesCount,
        ultima: replacement.ultima,
        partOfSpeech: replacement.partOfSpeech
      }))
    });

    await Promise.all(synonymPromises);

    return tokens;
  }

  /**
   * Adds ignored tag to tokens
   * @param tokens
   * @private
   */
  _markupIgnoredTokens(tokens) {
    // console.log(tokens)
    return tokens.map(token => {
      return {
        ...token,
        ignored: this._shouldIgnoreToken(token.name, token.state.tags)
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
    const ignoredTags = ['Determiner', 'Pronoun', 'Contraction', 'Conjunction', 'Copula', 'Modal', 'Auxiliary', 'Negative', 'Acronym'];

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

        return await this._getTermAndSynonyms(sanitizedToken, isLastTerm);
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
    .where('name', token.name);

    // Only add the POS condition if we have a match for a row with the pos (this helps overcome problems with NLP
    // packages marking words as one POS and the Words API marking them as something else. That said, I HATE this
    // solution.
    let count = await Term
    .query()
    .where('name', token.name)
    .where('partOfSpeech', token.partOfSpeech)
    .getCount();
    count = parseInt(count);

    if (count) {
      termQuery = termQuery.where('partOfSpeech', token.partOfSpeech);
    }

    let relationsFilter = builder => {

      // Kinds check
      let allowableKinds = [];
      if (this._flags.includeSynonyms) {
        allowableKinds.push(TermRelation.KIND.SYNONYM);
      }
      if (this._flags.includeAntonyms) {
        allowableKinds.push(TermRelation.KIND.ANTONYM);
      }
      if (this._flags.includeHypernyms) {
        allowableKinds.push(TermRelation.KIND.HYPERNYM);
      }
      if (this._flags.includeHyponyms) {
        allowableKinds.push(TermRelation.KIND.HYPONYM);
      }
      if (this._flags.includeHolonyms) {
        allowableKinds.push(TermRelation.KIND.HOLONYM);
      }
      if (this._flags.includeMeronyms) {
        allowableKinds.push(TermRelation.KIND.MERONYM);
      }
      if (this._flags.includeSimilars) {
        allowableKinds = allowableKinds.concat(TermRelation.SIMILAR_KINDS);
      }

      console.log('allowableKinds', allowableKinds);
      builder.whereInPivot('kind', allowableKinds);

      if (this._flags.preserveTermSyllableCount
        || (this._flags.preserveLineSyllableCount && isLastTerm)) {
        // TODO: Feels like there's a way to do this without a subquery
        let subquery = Database.select('syllablesCount')
          .from('terms')
          .where('name', token.name
          );

        if (count) {
          subquery.where('partOfSpeech', token.partOfSpeech);
        }
        console.log('aaaa');
        builder.where('syllablesCount', subquery)
      }

      if (this._flags.preserveTermRhyme
        || (this._flags.preserveLineRhyme && isLastTerm)) {
        // TODO: Feels like there's a way to do this without a subquery
        let subquery = Database.select('ultima')
          .from('terms')
          .where('name', token.name);

        if (count) {
          subquery.where('partOfSpeech', token.partOfSpeech);
        }

        builder.where('ultima', subquery)
      }
    };

    termQuery.with('relations', relationsFilter);

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
