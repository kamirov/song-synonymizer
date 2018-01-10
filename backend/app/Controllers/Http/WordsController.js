'use strict'

const WordStorageService = use('App/Services/WordStorageService');
const WordService = use('App/Services/WordService');
const Word = use ('App/Models/Word');

class WordController {

  async show({params}) {
    return await (new WordService).getWord(params.name);
  }

  async parseAndAddNew({request}) {
    let text = request.post().text;
    return await (new WordStorageService).addNewWords(text);
  }
}

module.exports = WordController
