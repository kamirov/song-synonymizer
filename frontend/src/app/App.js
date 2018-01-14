import React, {Component} from 'react';
import {Grid} from 'material-ui';

import SidebarContainer from '../sidebar/SidebarContainer';
import InputBoxContainer from '../synonymization/InputBoxContainer';
import OutputBoxContainer from '../synonymization/OutputBoxContainer';
import MessageContainer from "../message/MessageContainer";

class App extends Component {

    render() {
        return (
            <div>
                <Grid container spacing={24} justify="center">
                    <Grid item xs={12} sm={10}>
                        <Grid container>
                            <Grid item xs={12}>
                                <SidebarContainer />
                            </Grid>
                            <Grid item xs={12}>
                                <InputBoxContainer />
                                <OutputBoxContainer />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <MessageContainer />
            </div>
        );
    }
}

export default App;
