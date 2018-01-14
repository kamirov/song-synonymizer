const newWordsReducer = (state = [], action) => {
    switch (action.type) {
        case 'SET_NEW_WORDS':
            return action.newWords;
        default:
            return state;
    }
}

export default newWordsReducer;