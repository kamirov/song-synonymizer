import React from 'react';
import {FormControlLabel, FormGroup} from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import PropTypes from 'prop-types'
import Tooltip from 'material-ui/Tooltip';

const FlagsList = ({flags, flagDetails, onChange}) => {

    const flagControls = Object.keys(flags).map((key, idx) => {
        const formElement = <FormControlLabel
            key={idx}
            control={
                <Switch
                    checked={flags[key]}
                    disabled={flagDetails[key].disabled}
                    onChange={() => onChange(key)}
                />
            }
            label={flagDetails[key].label}
        />

        let returned;
        if (flagDetails[key].tooltip) {
            returned = <Tooltip
                key={idx + '-tooltip'}
                title={flagDetails[key].tooltip}>
                {formElement}
            </Tooltip>
        } else {
            returned = formElement;
        }

        return returned;
    });

    return <FormGroup>{flagControls}</FormGroup>
}

FlagsList.propTypes = {
    flags: PropTypes.object.isRequired,
    flagDetails: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
}

export default FlagsList;