'use strict'

const WordStorageService = use('App/Services/WordStorageService');
const Word = use ('App/Models/Word');

class WordController {

  async show({params}) {
    return await Word.findByOrFail('name', params.name);
  }

  async parseAndAddNew({request}) {
    let text = request.post().text;
    return await (new WordStorageService).addNewWords(text);
  }
}

module.exports = WordController
