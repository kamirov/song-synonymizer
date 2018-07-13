import React from 'react';
import {withStyles} from 'material-ui/styles';
import {CircularProgress} from 'material-ui/Progress';

const styles = theme => ({
    progress: {
        margin: `2rem ${theme.spacing.unit * 2}px`,
        textAlign: 'center'
    }
});

const Progress = ({classes}) => {
    return (
        <div className={classes.progress}>
            <CircularProgress className={classes.progress} color={"secondary"} thickness={7} />
        </div>
    );
}

export default withStyles(styles)(Progress);