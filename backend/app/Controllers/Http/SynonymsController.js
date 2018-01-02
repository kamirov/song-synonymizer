'use strict'

const SynonymService = require('App/Services/SynonymService');

class SynonymController {
  async synonymize({request}) {
    let synonymService = new SynonymService;
    let text = request.get('text');

    synonymService.setFlags(request.get('flags'));
    return await synonymService.synonymize(text);
  }
}

module.exports = SynonymController
