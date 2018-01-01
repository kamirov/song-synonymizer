'use strict'

const WordService = require('App/Services/WordService');

class WordController {

  async index({request}) {
    // STUB
  }

  async create({request}) {

  }

  async show({request}) {
    return {'a': 'b'}
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
