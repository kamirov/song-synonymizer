import {connect} from 'react-redux'
import {toggleFlag} from './flagsListActions';
import FlagsList from "./FlagsList";

const flagDetails = {
    preserveWordSyllableCount: {
        label: "Preserve word syllables",
        disabled: false
    },
    preserveWordRhyme: {
        label: "Preserve word rhyme",
        disabled: false
    },
    preserveLineSyllableCount: {
        label: "Preserve line syllables",
        disabled: true,
        tooltip: "Currently disabled. Need to do some more tinkering with this one."
    },
    preserveLineRhyme: {
        label: "Preserve line rhyme",
        disabled: false
    }
}

const mapStateToProps = (state, ownProps) => ({
    flags: state.flags,
    flagDetails: flagDetails,
    disabled: ownProps.disabled
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