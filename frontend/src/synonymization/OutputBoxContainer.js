import { connect } from 'react-redux'
import OutputBox from "./OutputBox";

const mapStateToProps = state => ({
    content: state.synonymization.synonymized,
    apiStatus: state.api.status,
    newTerms: state.newTerms
})

export default connect(
    mapStateToProps
)(OutputBox);