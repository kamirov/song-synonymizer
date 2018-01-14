import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {createStore} from 'redux'
import App from './app/App';
import RootReducer from './app/reducers';
import registerServiceWorker from './registerServiceWorker';

let store = createStore(RootReducer);

const unsubscribe = store.subscribe(() =>
    console.log('New State: ', store.getState())
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();
