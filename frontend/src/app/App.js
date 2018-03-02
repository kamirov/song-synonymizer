import React, { Component } from 'react';
import { Grid } from 'material-ui';

import SidebarContainer from '../sidebar/SidebarContainer';
import InputBoxContainer from '../synonymization/InputBoxContainer';
import OutputBoxContainer from '../synonymization/OutputBoxContainer';
import MessageContainer from "../message/MessageContainer";
import HeaderBar from "./HeaderBar";

class App extends Component {

    render() {
        return (
            <div>
                <HeaderBar/>
                <div className={'main'}>
                    <Grid container spacing={24}>
                        <Grid item xs={12} >
                            <Grid container>
                                <Grid item xs={12} sm={4} md={4} lg={3} xl={2}>
                                    <SidebarContainer />
                                </Grid>
                                <Grid item xs={12} sm={8} md={6} lg={5} xl={3}>
                                    <InputBoxContainer />
                                    <OutputBoxContainer />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <MessageContainer />
                </div>
            </div>
        );
    }
}

export default App;
