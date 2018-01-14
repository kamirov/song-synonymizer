import React from 'react';
import {FormControlLabel} from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import PropTypes from 'prop-types'
import Tooltip from 'material-ui/Tooltip';


const FlagsList = ({flags, flagDetails, disabled, onChange}) => {

    const flagControls = Object.keys(flags).map((key, idx) => {
        const formElement = <FormControlLabel
            key={idx}
            control={
                <Switch
                    checked={flags[key]}
                    disabled={flagDetails[key].disabled || disabled}
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

    return <span>{flagControls}</span>
}

FlagsList.propTypes = {
    flags: PropTypes.object.isRequired,
    flagDetails: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
}

export default FlagsList;