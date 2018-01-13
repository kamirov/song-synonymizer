const initialState = {
    original: "",
    synonymized: ""
}

const synonymizationReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ORIGINAL_TEXT':
            return {...state, original: action.text};
        case 'SET_SYNONYMIZED_TEXT':
            return {...state, synonymized: action.text};
        default:
            return state;
    }
}

export default synonymizationReducer;