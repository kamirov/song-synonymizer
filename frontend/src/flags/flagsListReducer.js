const initialState = {
    preserveWordRhyme: false,
    preserveWordSyllableCount: false,
    preserveLineRhyme: false,
    preserveLineSyllableCount: false
}

const flagsList = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_FLAGSLIST':
            return action.flagsList;
        default:
            return state;
    }
}

export default flagsList;