import {createStore} from 'redux'
import RootReducer from './reducers';
import apiConstants from "../api/apiConstants";

let initialState = {
    api: {
        status: apiConstants.STATUSES.NONE
    },
    newWords: ['a', 'b', 'c'],
    synonymization: {
        original: 'Bones',
        synonymized: "nice"
    }
}

let store = createStore(RootReducer, initialState);

// Logging
store.subscribe(() =>
    console.log('New State: ', store.getState())
);

export default store;