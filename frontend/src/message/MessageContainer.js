import {connect} from 'react-redux'
import Message from "./Message";
import apiConstants from "../api/apiConstants";

const mapStateToProps = state => ({
    content: state.message.content,
    open: state.message.open,
    apiStatus: state.api.status
})

const mapDispatchToProps = dispatch => ({
    onClick: (apiStatus) => {
        if (apiStatus !== apiConstants.STATUSES.FETCHING) {
            // dispatch(setOpen(false))
        }
    }
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Message);