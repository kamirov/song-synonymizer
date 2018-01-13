import {connect} from 'react-redux'
import {toggleFlag} from './flagsListActions';
import FlagsList from "./FlagsList";

const flagDetails = {
    preserveWordSyllableCount: {
        label: "Word syllables",
        disabled: false
    },
    preserveWordRhyme: {
        label: "Word rhyme",
        disabled: false
    },
    preserveLineSyllableCount: {
        label: "Line syllables",
        disabled: true,
        tooltip: "Currently disabled."
    },
    preserveLineRhyme: {
        label: "Line rhyme",
        disabled: false
    }
}

const mapStateToProps = state => ({
    flags: state.flags,
    flagDetails: flagDetails
})

const mapDispatchToProps = dispatch => ({
    onChange: flag => {
        dispatch(toggleFlag(flag))
    }
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlagsList);