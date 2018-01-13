const hashReducer = (state = null, action) => {
    switch (action.type) {
        case 'SET_HASH':
            return action.hash;
        default:
            return state;
    }
}

export default hashReducer;