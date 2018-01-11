import React from 'react';
import {FormControlLabel, FormGroup} from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import PropTypes from 'prop-types'


const FlagsList = ({flags, labels, onChange}) => {

    const flagControls = Object.keys(flags).map((key, idx) => {
        return <FormControlLabel
            key={idx}
            control={
                <Switch
                    checked={flags[key]}
                    onChange={onChange}
                />
            }
            label={labels[key]}
        />
    });

    return <FormGroup>{flagControls}</FormGroup>
}

FlagsList.propTypes = {
    flags: PropTypes.object.isRequired,
    labels: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
}

export default FlagsList;