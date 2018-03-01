import { connect } from 'react-redux'
import { toggleFlag } from './flagsListActions';
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
        disabled: false,
        tooltip: "Currently disabled. Need to do some more tinkering with this one."
    },
    preserveLineRhyme: {
        label: "Preserve line rhyme",
        disabled: false
    },
    includeSynonyms: {
        label: "Include synonyms",
        disabled: false,
        tooltip: "Words that are identical in denotative meaning (e.g. fast -> quick)"
    },
    includeAntonyms: {
        label: "Include antonyms",
        disabled: false,
        tooltip: "Words that are opposite in denotative meaning (e.g. bright -> dark)"
    },
    includeHypernyms: {
        label: "Include hypernyms",
        disabled: false,
        tooltip: "Words that are more generic in meaning (e.g. hachback -> car)"
    },
    includeHyponyms: {
        label: "Include hyponyms",
        disabled: false,
        tooltip: "Words that are more specific in meaning (e.g. vehicle -> ship)"
    },
    includeHolonyms: {
        label: "Include holonyms",
        disabled: false,
        tooltip: "Words denoting a larger, containing group (e.g. finger -> hand)"
    },
    includeMeronyms: {
        label: "Include meronyms",
        disabled: false,
        tooltip: "Words denoting a constituent component (e.g. man -> head)"
    },
    includeSimilars: {
        label: "Include similars",
        disabled: false,
        tooltip: "Words that are related in various ways"
    },
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