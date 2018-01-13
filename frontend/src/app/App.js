import React, {Component} from 'react';
import {Grid} from 'material-ui';

import FlagsList from '../flags/FlagsList';
import InputBox from '../synonymization/InputBox';
import OutputBox from '../synonymization/OutputBox';


const flags = {
    preserveWordRhyme: false,
    preserveWordSyllableCount: false,
    preserveLineRhyme: false,
    preserveLineSyllableCount: false,
};

const flagDetails = {
    preserveWordSyllableCount: {
        label: "Word syllables",
        disabled: false
    },
    preserveWordRhyme: {
        label: "Word rhyme",
        disabled: false
    },
    preserveLineSyllableCount: {
        label: "Line syllables",
        disabled: true,
        tooltip: "Currently disabled."
    },
    preserveLineRhyme: {
        label: "Line rhyme",
        disabled: false
    }
}

class App extends Component {

    render() {
        return (
            <div>
                <Grid container spacing={24} justify="center">
                    <Grid item xs={12} sm={10}>
                        <Grid container>
                            <Grid item xs={2}>
                                <FlagsList flags={flags} flagDetails={flagDetails}></FlagsList>
                            </Grid>
                            <Grid item xs={5}>
                                <InputBox content={"Hey"}></InputBox>
                            </Grid>
                            <Grid item xs={5}>
                                <OutputBox></OutputBox>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default App;
