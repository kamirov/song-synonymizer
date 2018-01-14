import {createStore} from 'redux'
import RootReducer from './reducers';

let initialState = {
    api: {
        status: 'ok'
    },
    newWords: ['a', 'b', 'c'],
    synonymization: {
        synonymized: "nice"
    }
}

let store = createStore(RootReducer, initialState);

// Logging
store.subscribe(() =>
    console.log('New State: ', store.getState())
);

export default store;