import { combineReducers } from 'redux'
import flags from '../sidebar/flagsListReducer';
import hash from '../hash/hashReducer';
import api from '../api/apiReducer';
import newTerms from '../newTerms/newTermsReducer';
import message from '../message/messageReducer';
import synonymization from '../synonymization/synonymizationReducer';

const rootReducer = combineReducers({
    synonymization,
    flags,
    hash,
    api,
    newTerms,
    message
})

export default rootReducer;