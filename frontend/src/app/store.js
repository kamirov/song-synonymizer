import {createStore} from 'redux'
import RootReducer from './reducers';

let store = createStore(RootReducer);

// Logging
store.subscribe(() =>
    console.log('New State: ', store.getState())
);

export default store;