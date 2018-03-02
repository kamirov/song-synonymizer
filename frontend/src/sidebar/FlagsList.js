import React from 'react';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import PropTypes from 'prop-types'
import Tooltip from 'material-ui/Tooltip';

import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary, } from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';

const FlagsList = ({flags, flagDetails, disabled, onChange}) => {

    const flagControls = {};

    Object.keys(flagDetails).map(ruleType => {
        flagControls[ruleType] = Object.keys(flagDetails[ruleType]).map((key, idx) => {
            const formElement = <FormControlLabel
                key={idx}
                control={
                    <Switch
                        checked={flags[key]}
                        disabled={flagDetails[ruleType][key].disabled || disabled}
                        onChange={() => onChange(key)}
                    />
                }
                label={flagDetails[ruleType][key].label}
            />

            let returned;
            if (flagDetails[ruleType][key].tooltip) {
                returned = <Tooltip
                    key={idx + '-tooltip'}
                    title={flagDetails[ruleType][key].tooltip}>
                    {formElement}
                </Tooltip>
            } else {
                returned = formElement;
            }

            return returned;
        });
    });


    return <div>
        <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Rhythm Rules</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <FormGroup>{flagControls.rhythm}</FormGroup>
            </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Word Rules</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <FormGroup>{flagControls.word}</FormGroup>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    </div>
}

FlagsList.propTypes = {
    flags: PropTypes.object.isRequired,
    flagDetails: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
}

export default FlagsList;