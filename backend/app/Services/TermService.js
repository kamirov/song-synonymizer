'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');
const nlp = require('compromise');

const Term = use('App/Models/Term');

class TermService {

  static get EMPTY_TERM_PARAMS() {
    return {
      relationsQueried: true,
      isEmpty: true
    }
  }

  static get PUNCTUATION_REGEX() {
    return /[.,\/#”"!$%\^&\*\?;:{}=\-_`~()\d]/g;
  }

  static get VOWELS() {
    return [
      'a', 'e', 'i', 'o', 'u'
    ]
  }

  static get IPA_VOWELS() {
    return [
      'i', 'y', 'ɨ', 'ʉ', 'ɯ', 'u', 'ɪ', 'ʏ', 'ɪ̈', 'ʊ̈', 'ʊ', 'e', 'ø', 'ɘ', 'ɵ', 'ɤ', 'o', 'e̞', 'ø̞', 'ə', 'ɤ̞',
      'o̞', 'ɛ', 'œ', 'ɜ', 'ɞ', 'ʌ', 'ɔ', 'æ', 'ɐ', 'a', 'ɶ', 'ä', 'ɑ', 'ɒ'
    ];
  }
  static get PRONOUNS() {
    return [
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'what', 'who',
      'it', 'whom',
      'mine', 'yours', 'his', 'hers', 'ours', 'theirs',
      'this', 'that', 'these', 'those',
      'which', 'whose', 'whoever', 'whatever', 'whichever', 'whomever',
      'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'
    ];
  }
  static get CONJUNCTIONS() {
    // Only coordinating conjunctions
    return [
      'for', 'and', 'nor', 'but', 'or', 'yet', 'so'
    ];
  }
  static get ARTICLES() {
    return [
      'the', 'an', 'a'
    ];
  }
  static get CONTRACTIONS() {
    return [
      "n't", "'s", "'m", "'re", "'ve", "'d", "'ll"
    ]
  }
  static get PREPOSITIONS() {
    return [
      "with", "at", "from", "into", "during", "including", "until", "against", "among",
      "throughout", "despite", "towards", "upon", "concerning", "of", "to", "in", "for",
      "on", "by", "about", "like", "through", "over", "before", "between", "after",
      "since", "without", "under", "within", "along", "following", "across", "behind",
      "beyond", "plus", "except", "but", "up", "out", "around", "down", "off", "above", "near"
    ];
  }

  static get GENERAL_CONTRACTIONS() {
    return [
      "'ve", "'s", "'", "'m"
    ]
  }

  // TODO: This should probably be in SynonymService
  static get IGNORED_TERMS() {
    return [
      // Common contractions (mostly from https://en.wikipedia.org/wiki/Wikipedia:List_of_English_contractions)
      "ain't", "amn't", "aren't", "can't", "cain't", "'cause", "could've", "couldn't",
      "daren't", "daresn't", "dasn't", "didn't", "doesn't", "don't", "gonna", "gotta",
      "hadn't", "hasn't", "haven't", "he'd", "he'll", "he's", "how'd", "how'll", "how's",
      "I'd", "I'll", "I'm", "I've", "isn't", "it'd", "it'll", "it's", "let's", "ma'am",
      "mayn't", "may've", "mightn't", "might've", "mustn't", "must've", "needn't", "ne'er",
      "o'clock", "o'er", "ol'", "oughtn't", "shan't", "she'd", "she'll", "she's", "should've",
      "shouldn't", "should of", "somebody's", "someone's", "something's", "that'll", "that're",
      "that's", "that'd", "there'd", "there're", "there's", "these're", "they'd", "they'll",
      "they're", "they've", "this's", "those're", "'tis", "'twas", "wasn't", "we'd", "we'd've",
      "we'll", "we're", "we've", "weren't", "what'd", "what'll", "what're", "what's", "what've",
      "when's", "where'd", "where're", "where's", "where've", "which's", "who'd", "who'd've",
      "who'll", "who're", "who's", "who've", "why'd", "why're", "why's", "won't", "would've",
      "wouldn't", "y'all", "you'd", "you'll", "you're", "you've", "noun's",

      // Terms that tend to synonymize poorly
      // TODO: Should probably put these in a DB table
      "need", "twenty", "have", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",

      // Miscellaneous
      "m'am", "ma'am"
    ]
  }

  isVowel(letter) {
    return TermService.VOWELS.includes(letter);
  }


  isPronoun(term) {
    return TermService.PRONOUNS.includes(term);
  }


  isConjunction(term) {
    return TermService.CONJUNCTIONS.includes(term);
  }


  isArticle(term) {
    return TermService.ARTICLES.includes(term);
  }


  isPreposition(term) {
    return TermService.PREPOSITIONS.includes(term);
  }

  isIgnoredTerm(term) {
    return TermService.IGNORED_TERMS.includes(term);
  }


  async getTerm(name) {
    return await Term
      .query()
      .where('name', name)
      .with('synonyms')
      .fetch();
  }


  createNormalizedTokens(text) {

    return nlp(text).out('terms')
    .map((token, tokenIdx) => {

      // Get token affixes
      let prefix = token.text.match(/^\W+/);
      let suffix = token.text.match(/\W+$/);

      // Sometimes affixes don't get stripped in the library's normalization, so manually do it here
      let normalizedTerm = token.normal;
      if (token.normal.endsWith(suffix)) {
        normalizedTerm = normalizedTerm.substring(0, normalizedTerm.lastIndexOf(suffix));
      }
      if (token.normal.startsWith(prefix)) {
        normalizedTerm = normalizedTerm.substring(prefix.length);
      }

      // UGH. Sometimes affixes get PARTIALLY stripped, (e.g. word,"), so strip all non-ascii chars from ends of
      // normalized text (just in case)
      normalizedTerm = normalizedTerm.replace(/^\W+/, '')
      normalizedTerm = normalizedTerm.replace(/\W+$/, '')

      // Get likely part of speech (assume it's the first common POS in the tags list)
      const mainPartsOfSpeech = ['Noun', 'Verb', 'Adverb', 'Preposition', 'Conjunction'];
      let partOfSpeech = token.tags[0].toLowerCase();
      for (let i = 0; i < token.tags.length; i++) {
        if (mainPartsOfSpeech.includes(token.tags[i])) {
          partOfSpeech = token.tags[i].toLowerCase();
          break;
        }
      }

      // Conjugate verb to infinitive (but keep tags)
      if (token.tags.includes('Verb') && !token.tags.includes('Copula')) {
        // TODO: I feel like there's a cleaner way to do this using the original nlp instance
        let possibleVerb = nlp(normalizedTerm).verbs().toInfinitive().out('text');
        if (possibleVerb) {
          normalizedTerm = possibleVerb;
        }
      }

      // Singularize
      if (token.tags.includes('Plural')) {
        // Some edge cases
        if (normalizedTerm === 'we') {
          normalizedTerm = 'i'
        } else {
          normalizedTerm = nlp(normalizedTerm).nouns(0).toSingular().out('text');
        }
      }

      // If contraction or aux, don't normalize (causes some bugs during synonymization)
      if (token.tags.includes('Contraction')
          || token.tags.includes('Auxiliary')) {
        normalizedTerm = token.text;
      }

      return {
        name: normalizedTerm,
        partOfSpeech: partOfSpeech,
        state: {
          prefix: prefix ? prefix[0] : null,
          suffix: suffix ? suffix[0] : null,
          tags: [...token.tags]
        }
      }

    }).filter(token => token.name);
  }


  /**
   * Gets ultima from an IPA representation of a term
   * (almost...this doesn't include the first 1-2 consonants of the ultima, so that might be a misnomer)
   *
   * @param {string} ipa
   * @returns {string}
   */
  getUltima(ipa) {

    let ultima = '';
    let encounteredVowel = false;
    for (let i = ipa.length-1; i >= 0; i--) {
      if (TermService.IPA_VOWELS.includes(ipa.charAt(i))) {
        ultima = ipa.charAt(i) + ultima;
        encounteredVowel = true;
      } else if (encounteredVowel) {
        break;
      } else {
        ultima = ipa.charAt(i) + ultima;
      }
    }

    return ultima;
  }


  uncontract(term) {

    let result = {
      term: term,
      contraction: null
    }

    TermService.GENERAL_CONTRACTIONS.forEach(contraction => {
      // TODO: We'll encounter a problem potentially with multiple contractions on one term
      // TODO: Might have problems with terms that have ' in the middle somewhere
      if (term.slice(-contraction.length) === contraction) {
        result.term = term.slice(0, -contraction.length)
        result.contraction = contraction;
      }
    });

    return result;
  }

}

module.exports = TermService;
