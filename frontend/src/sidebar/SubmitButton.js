import {connect} from 'react-redux'
import {setSynonymizedText} from '../synonymization/synonymizationActions';

const mapDispatchToProps = dispatch => ({
    onChange: text => {
        dispatch(setSynonymizedText(text))
    }
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InputBox);