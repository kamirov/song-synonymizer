import apiConstants from './apiConstants';

// Could just be a string, but feels like we could add something to this state
const initialState = {
    status: apiConstants.STATUSES.NONE
}

const apiReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_API_STATUS':
            return {...state, status: action.status};
        default:
            return state;
    }
}

export default apiReducer;