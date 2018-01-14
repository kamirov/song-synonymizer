import store from '../app/store';
import {setApiStatus} from "./apiActions";
import apiConstants from "./apiConstants";
import {setNewWords} from "../newWords/newWordsActions";
import {setSynonymizedText} from "../synonymization/synonymizationActions";
import {setMessage, setOpen} from "../message/messageActions";

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
        // I realize now this is a bad idea, since .getState() returns a snapshot, this will be out of sync after any of the dispatches in this service go through
        this._appState = store.getState()
    }

    async synonymize() {

        store.dispatch(setApiStatus(apiConstants.STATUSES.FETCHING));
        store.dispatch(setMessage(apiConstants.MESSAGES.FETCHING[0]));

        try {
            let addingWordsSucceeded = await this._addNewWords();
            if (addingWordsSucceeded) {
                let rawResponse = await fetch(
                    ApiService.ENDPOINTS.SYNONYMIZE, {
                        ...ApiService.REQUEST_POST_CONFIG,
                        body: JSON.stringify({
                            flags: this._appState.flags,
                            text: this._appState.synonymization.original
                        })
                    });

                if (rawResponse.status === 200) {
                    let response = await rawResponse.json();
                    store.dispatch(setApiStatus(apiConstants.STATUSES.OK));
                    store.dispatch(setSynonymizedText(response.synonymized));
                    store.dispatch(setOpen(false));
                }
            }
        } catch (e) {
            console.log(e);
            store.dispatch(setApiStatus(apiConstants.STATUSES.ERROR));
            store.dispatch(setMessage(apiConstants.MESSAGES.ERROR));
        }

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

        if (rawResponse.status === 200) {
            store.dispatch(setNewWords(response.newWords));
            return true;
        } else if (rawResponse.status === 500) {
            // TODO: Oh so dirty. Should send a key, but I'm at the tail end and just want to publish this already
            if (response.message === 'Exceeded daily Words API limit') {
                store.dispatch(setApiStatus(apiConstants.STATUSES.LIMIT));
                store.dispatch(setMessage(apiConstants.MESSAGES.LIMIT));
            } else {
                store.dispatch(setApiStatus(apiConstants.STATUSES.ERROR));
                store.dispatch(setMessage(apiConstants.MESSAGES.ERROR));
            }
        }
    }
}

export default ApiService;