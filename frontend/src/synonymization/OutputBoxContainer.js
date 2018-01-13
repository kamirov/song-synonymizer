import {connect} from 'react-redux'
import OutputBox from "./OutputBox";

const mapStateToProps = state => ({
    content: state.synonymization.synonymized
})


export default connect(
    mapStateToProps
)(OutputBox);