'use strict'

const SynonymService = use ('App/Services/SynonymService');

class SynonymController {
  async synonymize({request}) {
    let text = request.get('text');
    return await (new SynonymService).synonymize(text);
  }
}

module.exports = SynonymController
