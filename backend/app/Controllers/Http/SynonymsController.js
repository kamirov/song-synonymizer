'use strict'

const Logger = use('Logger');

const SynonymService = use('App/Services/SynonymService');
const TermStorageService = use('App/Services/TermStorageService');

class SynonymController {
  async synonymize({request}) {

    let newTerms = await (new TermStorageService).addNewTerms(request.post().text);

    // Synonymize
    let synonymService = new SynonymService;

    synonymService.setFlags(request.post().flags);
    let synonymized = await synonymService.processText(request.post().text);

    return { synonymized };
  }
}

module.exports = SynonymController
