import React from 'react';
import {withStyles} from 'material-ui/styles';
import TextField from 'material-ui/TextField';

const styles = theme => ({
    textField: {
    }
});

const OutputBox = ({content, classes}) => {
    return <TextField
        id="input"
        label="Synonymized"
        value={content}
        multiline={true}
        fullWidth={true}
        className={classes.textField}
    />
}

OutputBox.propTypes = {
    // content: PropTypes.string.isRequired
}

export default withStyles(styles)(OutputBox);