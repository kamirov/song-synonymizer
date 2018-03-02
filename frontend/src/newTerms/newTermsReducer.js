const newTermsReducer = (state = [], action) => {
    switch (action.type) {
        case 'SET_NEW_WORDS':
            return action.newTerms;
        default:
            return state;
    }
}

export default newTermsReducer;