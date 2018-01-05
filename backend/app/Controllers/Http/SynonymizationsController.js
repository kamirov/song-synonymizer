'use strict'

const SynonymizationService = use('App/Services/SynonymizationService');

class SynonymizationController {
  // TODO: Possibly use Adonis resources
  async add({request}) {

  }

  async get({request}) {
    let hash = request.get('hash');
    return await (new SynonymizationService.getFromHash(hash));
  }
}

module.exports = SynonymizationController
