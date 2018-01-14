import {connect} from 'react-redux'
import Message from "./Message";
import {setOpen} from "./messageActions";

const mapStateToProps = state => ({
    content: state.message.content,
    open: state.message.open
})

const mapDispatchToProps = dispatch => ({
    onClick: () => {
        dispatch(setOpen(false))
    }
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Message);