const initialState = {
    open: false,
    content: null
}

const messageReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_MESSAGE':
            return {
                ...state,
                content: action.content,
                open: true
            };
        case 'SET_OPEN':
            return {...state, open: action.open};
        default:
            return state;
    }
}

export default messageReducer;