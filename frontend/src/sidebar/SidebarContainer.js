import {connect} from 'react-redux'
import Sidebar from "./Sidebar";
import ApiService from "../api/ApiService";
import apiConstants from "../api/apiConstants";


const mapStateToProps = state => ({
    content: state.synonymization.original,
    disabled: state.api.status === apiConstants.STATUSES.FETCHING
})

const mapDispatchToProps = dispatch => ({
    onSynonymize: async () => {
        await (new ApiService).synonymize();
    },
    onShare: () => {}
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar);