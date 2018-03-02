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
      preserveLineSyllableCount: true,
      preserveTermRhyme: false,
      preserveLineRhyme: false,

      includeOriginals: true,
      includeSynonyms: true,
      includeAntonyms: true,
      includeHypernyms: false,
      includeHyponyms: false,
      includeHolonyms: false,
      includeMeronyms: false,
      includeSimilars: false,

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
    this._flags = Object.assign({}, SynonymService.DEFAULT_FLAGS, flags);
  }

  /**
   * Main function
   * @param text
   * @returns {Promise<string>}
   */
  async processText(text) {
    let lines = this._splitTextIntoLines(text);

    let linesPromises = lines.map(async line => {

      // Tokenize, normalize, invalidate
      let tokens = this._termService.createNormalizedTokens(line);

      let tokensWithValidation = this._markupIgnoredTokens(tokens);

      // return tokensWithValidation;

      // Synonymize
      let tokensWithRelations = await this._addTermAndReplacements(tokensWithValidation);
      let tokensWithSynonymization = await this._addSynonymization(tokensWithRelations);

      // Denormalize
      let denormalizedTermNames = await this._denormalizeTokens(tokensWithSynonymization);

      return denormalizedTermNames;

      // Correct
      let correctedNames = this._correctTermNames(denormalizedTermNames);

      // Detokenizes
      let synonymizedText = correctedNames.join(' ');

      return synonymizedText;

    });

    return await Promise.all(linesPromises);
    return (await Promise.all(linesPromises)).join('\n');
  }

  _correctTermNames(termNames) {
    let correctedTermNames = termNames.slice();

    // Article issues
    correctedTermNames = this._correctArticles(correctedTermNames);

    // Specific phrases
    correctedTermNames = this._correctPhrases(correctedTermNames);

    return correctedTermNames;
  }

  async _denormalizeTokens(tokens) {
    return tokens.map(token => {

      // console.log(token.state);
      let name = token.synonymization;
      // console.log(token);
      
      if (token.state.tags.includes('Plural')) {
        // Can probably do this with the NLP package as well
        name = pluralize.plural(name);
      }

      // Conjugations
      if (!token.state.tags.includes('Auxiliary')) {
        let possibleName;
        if (token.state.tags.includes('PastTense')) {
            possibleName = nlp(name).tag('Verb').verbs(0).toPastTense().out();
        // } else if (token.state.tags.includes('PresentTense')) {
        //   possibleName = nlp(name).verbs(0).toPresentTense().out();
        } else if (token.state.tags.includes('FutureTense')) {
          possibleName = nlp(name).tag('Verb').verbs(0).toFutureTense().out();
        } else if (token.state.tags.includes('Gerund')) {
          possibleName = name + 'ing';
        }
        name = possibleName || name;
      }

      if (token.state.tags.includes('TitleCase')) {
        if (name.length > 1) { 
          name = name[0].toUpperCase() + name.slice(1);  
        } else {
          name = name[0].toUpperCase()
        }
        // console.log(name, token.state.tags);
      }

      if (token.state.tags.includes('Acronym')) {
        name = name.toUpperCase();
      }

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
      // console.log('originalSyllableCount', originalSyllableCount)

      // Get all combinations of replacements' indices
      let replacementIndices = tokens.map(token => {
        // console.log('token.name', token.name)
        if (token.replacements.length)
          return Array.from(Array(token.replacements.length).keys())
        return [0]    // No replacements case (we handle this later on)
      })

      // Randomize replacement indices
      replacementIndices = replacementIndices.map(replacementIndicesItem => {
        return this._shuffleArray(replacementIndicesItem);
      })

      console.log(replacementIndices);
      let allReplacementIndicesSets = this._getCartesianProduct(...replacementIndices);

      // Get all synonym groupings that meet the syllable count
      let synonymGroupings = [];
      allReplacementIndicesSets.forEach(replacementIndicesSet => {
        // console.log('replacementIndicesSet', replacementIndicesSet);
        let synonymGrouping = [];
        for (let i = 0; i < tokens.length; i++) {

          // If no replacements, create a fake one based on the real word
          if (tokens[i].replacements.length) {
            // console.log('a', i, replacementIndicesSet, replacementIndicesSet[i]);
            // console.log(tokens[i].replacements[replacementIndicesSet[i]])
            // console.log(tokens[i].replacements[replacementIndicesSet[i]]);
            synonymGrouping.push(tokens[i].replacements[replacementIndicesSet[i]]);
          } else {
            let fakeReplacement = {
              name: tokens[i].name,
              syllablesCount: tokens[i].syllablesCount,
              ultima: tokens[i].ultima,
              partOfSpeech: tokens[i].partOfSpeech
            }

            synonymGrouping.push(fakeReplacement);
          }

        }

        // Compare syllable count
        let syllablesCount = synonymGrouping.reduce((runningCount, replacement) => {
          return runningCount + replacement.syllablesCount;
        }, 0);

        // console.log(syllablesCount, originalSyllableCount);

        if (syllablesCount === originalSyllableCount) {
          synonymGroupings.push(synonymGrouping);
        }
      });

      // If we don't have any viable syn groupings, we just use the originals
      let synonymGrouping;
      if (synonymGroupings.length) {
        synonymGrouping = this._getRandomArrayElement(synonymGroupings);
      } else {
        synonymGrouping = tokens.map(token => {
          return {
            name: token.name,
            syllablesCount: token.syllablesCount,
            ultima: token.ultima,
            partOfSpeech: token.partOfSpeech
          }
        })
      }

      // Take a random synonym grouping
      return tokens.map((token, tokenIdx) => {
        let synonymization = synonymGrouping[tokenIdx].name;
        return {
          ...token,
          synonymization: synonymization,
        }
      })

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
    }


    return tokens;
  }

  async _addTermAndReplacements(tokens) {

    let synonymPromises = tokens.map(async (token, tokenIdx) => {

      let isLast = tokenIdx === (tokens.length-1);

      // console.log('-----------');
      // console.log(token);

      let termWithSynonyms = (await this._getTermAndSynonyms(token, isLast)).toJSON();

      // Add main term elements to token
      token.syllablesCount = termWithSynonyms.syllablesCount;
      token.ultima = termWithSynonyms.ultima;

      token.replacements = termWithSynonyms.relations.map(replacement => ({
        name: replacement.name,
        syllablesCount: replacement.syllablesCount,
        ultima: replacement.ultima,
        partOfSpeech: replacement.partOfSpeech
      }))

      if (this._flags.includeOriginals) {
        token.replacements.push({
          name: token.name,
          syllablesCount: token.syllablesCount,
          ultima: token.ultima,
          partOfSpeech: token.partOfSpeech
        })
      }
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
        || this._termService.isPreposition(term)
        || this._termService.isArticle(term)
        || this._termService.isConjunction(term)
        || term.length < SynonymService.MIN_LETTER_COUNT_TO_SYNONYMIZE) {
      return true;
    }

    return false;
  }

  /**
   * Some miscellaneous corrections
   * @param replacements
   * @returns {*}
   * @private
   */
  _correctPhrases(replacements) {
    const possessivePronouns = ['my', 'your', 'his', 'her', 'our', 'their'];
    const needOfIfPreceedingPronounWords = ['all', 'some', 'last', 'each', 'every'];

      for (let i = 0; i < replacements.length-1; i++) {
        // All fix
        if (needOfIfPreceedingPronounWords.includes(replacements[i])
            && possessivePronouns.includes(replacements[i + 1])) {
          replacements[i] += ' of';
        }

        // TODO: Should convert these if statements to a hashmap

        // NLP engine doesn't pick this up for some reason
        if (replacements[i] === 'i') {
          replacements[i] = 'I';
        }

        if (replacements[i] === 'get together' && replacements[i+1] !== 'with') {
          replacements[i] = 'get together with';
        }
      }



    return replacements;
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

    return replacements;
  }

  _getCartesianProduct(paramArray) {
    let maxIterations = 1000;
    let currentIteration = 0;

    function addTo(curr, args) {
      currentIteration++;
      // console.log('cur', curr, args);

      var i, copy,
        rest = args.slice(1),
        last = !rest.length,
        result = [];

      for (i = 0; i < args[0].length; i++) {

        copy = curr.slice();
        copy.push(args[0][i]);

        if (last) {
          result.push(copy);
        } else {
          // console.log(currentIteration);
          if (currentIteration <= maxIterations) {
            result = result.concat(addTo(copy, rest));            
          }
        }
      }

      return result;
    }


    return addTo([], Array.prototype.slice.call(arguments));
  }

  _getRandomArrayElement(array) {
    // TODO: Should move to an array helper class
    return array[Math.floor(Math.random()*array.length)];
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
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

      // console.log(this._flags);

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

      // console.log('allowableKinds', allowableKinds);
      builder.whereIn('kind', allowableKinds);

      if (this._flags.preserveTermSyllableCount) {
        // TODO: Feels like there's a way to do this without a subquery
        let subquery = Database.select('syllablesCount')
          .from('terms')
          .where('name', token.name)
          .limit(1);

        if (count) {
          subquery.where('partOfSpeech', token.partOfSpeech);
        }
        builder.where('syllablesCount', subquery).limit(1)
      }

      if (this._flags.preserveTermRhyme
        || (this._flags.preserveLineRhyme && isLastTerm)) {
        // TODO: Feels like there's a way to do this without a subquery
        let subquery = Database.select('ultima')
          .from('terms')
          .where('name', token.name)
          .limit(1);

        // console.log('token', token.name, token.partOfSpeech, count);

        if (count) {
          subquery.where('partOfSpeech', token.partOfSpeech);
        }

        builder.where('ultima', subquery)
      }
    };

    termQuery.with('relations', relationsFilter);

    return await termQuery.first();
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
