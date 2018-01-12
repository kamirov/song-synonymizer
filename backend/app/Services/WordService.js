'use strict'

const Logger = use('Logger');

const pluralize = require('pluralize');
const Word = use('App/Models/Word');

class WordService {

  static get EMPTY_WORD_PARAMS() {
    return {
      hasCheckedSynonyms: true,
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

  static get IGNORED_WORDS() {
    // TODO: Should probably put these in a DB table
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

      // Miscellaneous
      "m'am", "ma'am"
    ]
  }

  isVowel(letter) {
    return WordService.VOWELS.includes(letter);
  }


  isPronoun(word) {
    return WordService.PRONOUNS.includes(word);
  }


  isConjunction(word) {
    return WordService.CONJUNCTIONS.includes(word);
  }


  isArticle(word) {
    return WordService.ARTICLES.includes(word);
  }


  isPreposition(word) {
    return WordService.PREPOSITIONS.includes(word);
  }

  isIgnoredWord(word) {
    return WordService.IGNORED_WORDS.includes(word);
  }


  async getWord(name) {
    return await Word
      .query()
      .where('name', name)
      .with('synonyms')
      .fetch();
  }


  /**
   * Gets ultima from an IPA representation of a word
   * (almost...this doesn't include the first 1-2 consonants of the ultima, so that might be a misnomer)
   *
   * @param {string} ipa
   * @returns {string}
   */
  getUltima(ipa) {

    let ultima = '';
    let encounteredVowel = false;
    for (let i = ipa.length-1; i >= 0; i--) {
      if (WordService.IPA_VOWELS.includes(ipa.charAt(i))) {
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


  uncontract(word) {

    let result = {
      word: word,
      contraction: null
    }

    WordService.GENERAL_CONTRACTIONS.forEach(contraction => {
      // TODO: We'll encounter a problem potentially with multiple contractions on one word
      // TODO: Might have problems with words that have ' in the middle somewhere
      if (word.slice(-contraction.length) === contraction) {
        result.word = word.slice(0, -contraction.length)
        result.contraction = contraction;
      }
    });

    return result;
  }

}

module.exports = WordService;
