import {connect} from 'react-redux'
import {setOriginalText} from './synonymizationActions';
import InputBox from "./InputBox";
import apiConstants from "../api/apiConstants";
import {setApiStatus} from "../api/apiActions";
import store from "../app/store";

const mapStateToProps = state => ({
    content: state.synonymization.original,
    disabled: state.api.status === apiConstants.STATUSES.FETCHING
})

const mapDispatchToProps = dispatch => ({
    onChange: text => {
        dispatch(setOriginalText(text))
        store.dispatch(setApiStatus(apiConstants.STATUSES.NONE));
    }
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InputBox);