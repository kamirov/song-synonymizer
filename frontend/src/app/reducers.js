import {combineReducers} from 'redux'
import flags from '../flags/flagsListReducer';
import hash from '../hash/hashReducer';
import synonymization from '../synonymization/synonymizationReducer';

const rootReducer = combineReducers({
    synonymization,
    flags,
    hash
})

export default rootReducer;