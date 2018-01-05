'use strict'

const WordService = use('App/Services/WordService');

class WordController {

  async index({request}) {
    // STUB
  }

  async create({request}) {

  }

  async show({request}) {

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
