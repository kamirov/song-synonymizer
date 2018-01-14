import {connect} from 'react-redux'
import Sidebar from "./Sidebar";
import ApiService from "../api/ApiService";


const mapStateToProps = state => ({
    content: state.synonymization.original
})

const mapDispatchToProps = dispatch => ({
    onSummarize: async () => {
        await (new ApiService).synonymize();
    },
    onShare: () => {}
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar);