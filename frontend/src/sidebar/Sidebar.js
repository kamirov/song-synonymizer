import React from 'react';
import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types'
import {FormControlLabel} from 'material-ui/Form';

import FlagsListContainer from "./FlagsListContainer";

const styles = theme => ({
    button: {
        marginLeft: '1rem'
    }
});

const Sidebar = ({classes, onSummarize, disabled}) => {
    return <div>
            <FlagsListContainer disabled={disabled} />
            <FormControlLabel
            control={
                <Button raised disabled={disabled} color="accent" onClick={onSummarize} className={classes.button}>
                Summarize</Button>
            }/>
    </div>
}

export default withStyles(styles)(Sidebar);

Sidebar.propTypes = {
    onSummarize: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired
}