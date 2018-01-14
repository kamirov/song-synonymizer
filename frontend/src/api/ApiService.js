import store from '../app/store';
import {setApiStatus} from "./apiActions";
import apiConstants from "./apiConstants";
import {setNewWords} from "../newWords/newWordsActions";
import {setSynonymizedText} from "../synonymization/synonymizationActions";

// TODO: This SHOULD be decoupled from Redux, or at least from the app state. Better for us to manually pass the related state variables
class ApiService {

    static get ENDPOINTS() {
        const BASE_PATH = "http://localhost:3000";

        return {
            SYNONYMIZE: `${BASE_PATH}/synonymize`,
            ADD_NEW_WORDS: `${BASE_PATH}/words/add-new`
        }
    }

    static get REQUEST_HEADERS() {
        return {
            'accept': 'application/json',
            'content-type': 'application/json',
        }
    }

    static get REQUEST_GET_CONFIG() {
        return {
            method: 'get',
            headers: ApiService.REQUEST_HEADERS
        }
    }

    static get REQUEST_POST_CONFIG() {
        return {
            method: 'post',
            headers: ApiService.REQUEST_HEADERS
        }
    }

    constructor() {
        this._appState = store.getState()
    }

    async synonymize() {

        store.dispatch(setApiStatus(apiConstants.STATUSES.FETCHING));

        await this._addNewWords();

        let rawResponse = await fetch(
            ApiService.ENDPOINTS.SYNONYMIZE, {
                ...ApiService.REQUEST_POST_CONFIG,
                body: JSON.stringify({
                    // flags: appState.flags,
                    text: this._appState.synonymization.original
                })
            });

        console.log('synonymizeRaw', rawResponse);

        let response = await rawResponse.json();

        if (rawResponse.status === 200) {
            store.dispatch(setApiStatus(apiConstants.STATUSES.OK));
            store.dispatch(setSynonymizedText(response.synonymized));
        }

        // if ()

        console.log('response', response);
    }

    async _addNewWords() {
        let rawResponse = await fetch(
            ApiService.ENDPOINTS.ADD_NEW_WORDS, {
                ...ApiService.REQUEST_POST_CONFIG,
                body: JSON.stringify({
                    text: this._appState.synonymization.original
                })
            });

        let response = await rawResponse.json();
        store.dispatch(setNewWords(response.newWords));
    }
}

export default ApiService;