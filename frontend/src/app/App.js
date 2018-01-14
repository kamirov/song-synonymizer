import React, {Component} from 'react';
import {Grid} from 'material-ui';

import SidebarContainer from '../sidebar/SidebarContainer';
import InputBoxContainer from '../synonymization/InputBoxContainer';
import OutputBoxContainer from '../synonymization/OutputBoxContainer';

class App extends Component {

    render() {
        return (
            <div>
                <Grid container spacing={24} justify="center">
                    <Grid item xs={12} sm={10}>
                        <Grid container>
                            <Grid item xs={2}>
                                <SidebarContainer />
                            </Grid>
                            <Grid item xs={5}>
                                <InputBoxContainer />
                            </Grid>
                            <Grid item xs={5}>
                                <OutputBoxContainer />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default App;
