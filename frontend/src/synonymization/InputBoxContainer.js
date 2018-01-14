import {connect} from 'react-redux'
import {setOriginalText} from './synonymizationActions';
import InputBox from "./InputBox";
import apiConstants from "../api/apiConstants";

const mapStateToProps = state => ({
    content: state.synonymization.original,
    disabled: state.api.status === apiConstants.STATUSES.FETCHING
})

const mapDispatchToProps = dispatch => ({
    onChange: text => {
        dispatch(setOriginalText(text))
    }
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InputBox);