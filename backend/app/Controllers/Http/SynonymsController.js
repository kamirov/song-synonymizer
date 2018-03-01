'use strict'

const Logger = use('Logger');

const SynonymService = use('App/Services/SynonymService');


class SynonymController {
  async synonymize({request}) {

    // Synonymize
    let synonymService = new SynonymService;

    synonymService.setFlags(request.post().flags);
    let synonymized = await synonymService.processText(request.post().text);

    return { synonymized };
  }
}

module.exports = SynonymController
