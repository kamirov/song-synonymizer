import {connect} from 'react-redux'
import Sidebar from "./Sidebar";
import ApiService from "../api/ApiService";
import apiConstants from "../api/apiConstants";


const getSynonymizeButtonText = (apiStatus) => {
    switch (apiStatus) {
        case apiConstants.STATUSES.OK:
            return 'Resynonymize'
        default:
            return 'Synonymize'

    }
}

const mapStateToProps = state => ({
    content: state.synonymization.original,
    disabled: state.api.status === apiConstants.STATUSES.FETCHING,
    onlyButtonDisabled: !state.synonymization.original,
    synonymizeButtonText: getSynonymizeButtonText(state.api.status)
})

const mapDispatchToProps = dispatch => ({
    onSynonymize: async () => {
        await (new ApiService()).synonymize();
    },
    onShare: () => {}
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar);