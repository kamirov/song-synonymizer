import React from 'react';
import {withStyles} from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types'

const styles = theme => ({
    textField: {
        lineHeight: '1.5rem'
    }
});

// TODO: This SHOULD be a stateless component, but I didn't want to deal with redux-form just for a text area. Easier (but dirtier) to let this field have its own state
class InputBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: this.props.content };

        this.handleChange = this.handleChange.bind(this);
    }

    async handleChange(event) {
        await this.setState({ value: event.target.value });
        this.props.onChange(this.state.value);
    }

    render() {
        return <TextField
            id="input"
            label="Type the lyrics to a song/poem"
            value={this.state.value}
            onChange={this.handleChange}
            multiline={true}
            fullWidth={true}
            className={this.props.classes.textField}
        />
    }
}

InputBox.propTypes = {
    content: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}

export default withStyles(styles)(InputBox);