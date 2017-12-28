'use strict'

const pluralize = require('pluralize');
const Logger = use('Logger');
const ExternalWordService = use('App/Services/ExternalWordService');

class WordService {

  static get IPA_VOWELS() {
    return ['i', 'y', 'ɨ', 'ʉ', 'ɯ', 'u', 'ɪ', 'ʏ', 'ɪ̈', 'ʊ̈', 'ʊ', 'e', 'ø', 'ɘ', 'ɵ', 'ɤ', 'o', 'e̞', 'ø̞', 'ə', 'ɤ̞',
            'o̞', 'ɛ', 'œ', 'ɜ', 'ɞ', 'ʌ', 'ɔ', 'æ', 'ɐ', 'a', 'ɶ', 'ä', 'ɑ', 'ɒ'];
  }

  addNewWords(text) {
    let words = this.splitIntoUsableWords(text);

    words.forEach(name => {
      let wordInDatabase = false; //tmp
      if (!wordInDatabase) {


      }
    });
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


  /**
   * Parses individual words in a block of text. Depluralizes, removes duplicates, and unusable words
   * @param text
   * @returns {string[]}
   */
  splitIntoUsableWords(text) {
    let words;

    // Remove punctuation and split by space or new line
    words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\d]/g, '').split(/[ \n]/);

    // Depluralize
    words = words.map((word) => {
      return pluralize.singular(word);
    });

    // Remove duplicates
    words = [...new Set(words)];

    // Remove empty entries
    words = words.filter(word => word)

    // Remove words with non-ascii characters
    // TODO: Should we really remove these?
    words = words.filter(word => !word.match(/[^\x00-\x7F]/g));

    // Remove words with punctuation
    // TODO: Should we really remove these?
    words = words.filter(word => !word.match(/['"]/g));

    Logger.info('Parsed words: ' + words);

    return words;
  }

}

module.exports = WordService;
