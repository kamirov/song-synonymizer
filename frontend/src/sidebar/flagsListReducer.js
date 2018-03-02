const initialState = {
    preserveTermRhyme: false,
    preserveTermSyllableCount: false,
    preserveLineRhyme: false,
    preserveLineSyllableCount: false,

    includeOriginals: true,
    includeSynonyms: true,
    includeAntonyms: true,
    includeHypernyms: true,
    includeHyponyms: true,
    includeHolonyms: true,
    includeMeronyms: true,
    includeSimilars: true,
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