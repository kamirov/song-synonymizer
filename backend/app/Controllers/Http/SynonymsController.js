'use strict'

const Logger = use('Logger');

const SynonymService = use('App/Services/SynonymService');

class SynonymController {
  async synonymize({request}) {
    let synonymService = new SynonymService;
    synonymService.setFlags(request.post().flags);
    return await synonymService.synonymize(request.post().text);
  }
}

module.exports = SynonymController
