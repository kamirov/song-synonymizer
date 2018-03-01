'use strict'

const TermStorageService = use('App/Services/TermStorageService');
const TermService = use('App/Services/TermService');

class TermController {

  async show({params}) {
    return await (new TermService).getTerm(params.name);
  }

  async parseAndAddNew({request}) {
    let text = request.post().text;
    let newTerms = await (new TermStorageService).addNewTerms(text);

    return { newTerms };
  }
}

module.exports = TermController
