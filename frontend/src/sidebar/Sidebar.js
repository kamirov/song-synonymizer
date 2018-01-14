import React from 'react';
import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types'

import FlagsListContainer from "./FlagsListContainer";

const styles = theme => ({
    button: {
    }
});

const Sidebar = ({classes, onSummarize, onShare}) => {
    return <div>
        <FlagsListContainer />
        <div>
            <Button color="primary" onClick={onShare} className={classes.button}>
                Share
            </Button>
            <Button raised color="accent" onClick={onSummarize} className={classes.button}>
                Summarize
            </Button>
        </div>
    </div>
}

export default withStyles(styles)(Sidebar);

Sidebar.propTypes = {
    onSummarize: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired
}