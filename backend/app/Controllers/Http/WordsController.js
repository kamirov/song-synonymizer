'use strict'

const WordService = use('App/Services/WordService');
const Word = use ('App/Models/Word');

class WordController {

  async show({params}) {
    return await Word.findByOrFail('name', params.name);
  }

  async parseAndAddNew({request}) {
    let text = request.get('text');
    return await (new WordService.addNewWords(text));
  }
}

module.exports = WordController
