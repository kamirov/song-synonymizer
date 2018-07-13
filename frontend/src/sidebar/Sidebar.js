import React from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types'
import { Grid } from 'material-ui';

import FlagsListContainer from "./FlagsListContainer";

const styles = theme => ({
    button: {
        width: '100%',
        // marginTop: "1rem"
        // maxWidth: '201px'
    },
    sidebar: {
        textAlign: 'left'
    }
});

const Sidebar = ({classes, onSynonymize, disabled, onlyButtonDisabled, synonymizeButtonText}) => {
    return <div>
        <Grid container className={classes.sidebar} justify={"flex-end"} spacing={24}>
            <Grid item xs={12}>
                <FlagsListContainer disabled={disabled} />
            </Grid>
            <Grid item xs={12}>
                <Button variant="raised" disabled={disabled || onlyButtonDisabled} color="secondary" onClick={onSynonymize} className={classes.button}>
                    {synonymizeButtonText}</Button>
            </Grid>
        </Grid>
    </div>
}

export default withStyles(styles)(Sidebar);

Sidebar.propTypes = {
    onSynonymize: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired
}