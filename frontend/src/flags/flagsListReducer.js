const initialState = {
    preserveWordRhyme: false,
    preserveWordSyllableCount: false,
    preserveLineRhyme: false,
    preserveLineSyllableCount: false
}

const flagsList = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_FLAGLIST':
            return action.flagList;
        default:
            return state;
    }
}

export default flagsList;