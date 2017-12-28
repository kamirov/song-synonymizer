'use strict'

class WordService {

  static get IPA_VOWELS() {
    return ['i', 'y', 'ɨ', 'ʉ', 'ɯ', 'u', 'ɪ', 'ʏ', 'ɪ̈', 'ʊ̈', 'ʊ', 'e', 'ø', 'ɘ', 'ɵ', 'ɤ', 'o', 'e̞', 'ø̞', 'ə', 'ɤ̞',
            'o̞', 'ɛ', 'œ', 'ɜ', 'ɞ', 'ʌ', 'ɔ', 'æ', 'ɐ', 'a', 'ɶ', 'ä', 'ɑ', 'ɒ'];
  }

  /**
   * Gets ultima from an IPA representation of a word
   * (almost...this doesn't include the first 1-2 consonants of the ultima, so that might be a misnomer)
   *
   * @param {any} ipa
   * @returns
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

}

module.exports = WordService;
