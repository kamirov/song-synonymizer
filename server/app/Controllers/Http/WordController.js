'use strict'

const WordService = use('App/Services/WordService');

class WordController {

  // TODO: Look into adonis resources for words

  async get({request}) {
    // STUB
  }

  async add({request}) {
    // STUB
  }

  async parseAndAddNew({request}) {
    let text = request.get('text');
    return await (new WordService.addNewWords(text));
  }
}

module.exports = WordController
