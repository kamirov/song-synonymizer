import {combineReducers} from 'redux'
import flags from '../sidebar/flagsListReducer';
import hash from '../hash/hashReducer';
import api from '../api/apiReducer';
import newWords from '../newWords/newWordsReducer';
import synonymization from '../synonymization/synonymizationReducer';

const rootReducer = combineReducers({
    synonymization,
    flags,
    hash,
    api,
    newWords
})

export default rootReducer;