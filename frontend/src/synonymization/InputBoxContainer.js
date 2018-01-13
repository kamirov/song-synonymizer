import {connect} from 'react-redux'
import {setOriginalText} from './synonymizationActions';
import InputBox from "./InputBox";

const mapStateToProps = state => ({
    content: state.synonymization.original
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