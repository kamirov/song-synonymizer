'use strict'

const Logger = use('Logger');

const SynonymService = use('App/Services/SynonymService');
const WordStorageService = use('App/Services/WordStorageService');

class SynonymController {
  async synonymize({request}) {
    // Add new words (if any)
    let text = request.post().text;
    await (new WordStorageService).addNewWords(text);

    // Synonymize
    let synonymService = new SynonymService;

    synonymService.setFlags(JSON.parse(request.post().flags));
    return await synonymService.synonymize(request.post().text);
  }
}

module.exports = SynonymController
