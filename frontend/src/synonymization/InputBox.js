import React from 'react';
import {withStyles} from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types'

const styles = theme => ({
    textField: {
    }
});

const InputBox = ({content, classes, onChange}) => {
    return <TextField
        id="input"
        label="Original"
        value={content}
        onChange={onChange}
        multiline={true}
        fullWidth={true}
        className={classes.textField}
    />
}

InputBox.propTypes = {
    content: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}

export default withStyles(styles)(InputBox);