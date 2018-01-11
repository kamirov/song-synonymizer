import React, {Component} from 'react';
import {Grid} from 'material-ui';

import FlagsList from '../flags/FlagsList';
import InputBox from '../contentBoxes/InputBox';
import OutputBox from '../contentBoxes/OutputBox';


const flags = {
    preserveWordSyllableCount: false,
    preserveWordRhyme: false,
    preserveLineSyllableCount: false,
    preserveLineRhyme: false,
    preservePronouns: true,
    preserveArticles: true,
    preserveConjunctions: true
};

const labels = {
    preserveWordSyllableCount: "Word syllables",
    preserveWordRhyme: "Word rhyme",
    preserveLineSyllableCount: "Line syllables",
    preserveLineRhyme: "Line rhyme",
    preservePronouns: "Pronouns",
    preserveArticles: "Articles",
    preserveConjunctions: "Conjunctions"
}

class App extends Component {

    render() {
        return (
            <div>
                <Grid container spacing={24} justify="center">
                    <Grid item xs={12} sm={10}>
                        <Grid container>
                            <Grid item xs={2}>
                                <FlagsList flags={flags} labels={labels}></FlagsList>
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
