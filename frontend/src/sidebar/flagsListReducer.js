const initialState = {
    preserveWordRhyme: false,
    preserveWordSyllableCount: false,
    preserveLineRhyme: false,
    preserveLineSyllableCount: false
}

const flagsList = (state = initialState, action) => {
    switch (action.type) {
        case 'TOGGLE_FLAG':
            return {...state,  [action.flag]: !state[action.flag] };
        default:
            return state;
    }
}

export default flagsList;