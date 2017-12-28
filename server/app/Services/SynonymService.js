'use strict'

class SynonymService {

  static get ALLOWABLE_FLAGS() {
    return ['preserveWordSyllableCount',
            'preserveLineSyllableCount',
            'preserveWordRhyme',
            'preserveLineRhyme',
            'preservePronouns',
            'preserveArticles']
  }

  filterFlags(flags) {
    // TODO: function should check to make sure only allowable flags are set
    return flags;
  }
}

module.exports = SynonymService;
