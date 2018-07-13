import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import Favorite from 'material-ui-icons/Favorite';


const styles = {
    root: {
        width: '100%',
    },
    flex: {
        flex: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class MenuAppBar extends React.Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography type="title" color="inherit" className={classes.flex}>
                            Song Synonymizer
                        </Typography>
                        <Tooltip
                            title="Made with &#10084; and JS by kamirov">
                            <IconButton target="_blank" href="http://andreis.place" rel="noopener noreferrer"
                                color="secondary"
                            >
                                <Favorite />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

MenuAppBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MenuAppBar);