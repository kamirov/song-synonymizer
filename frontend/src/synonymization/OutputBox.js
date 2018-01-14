import React from 'react';
import {withStyles} from 'material-ui/styles';
import apiConstants from "../api/apiConstants";
import Progress from "./Progress";
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    paper: theme.mixins.gutters({
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: theme.spacing.unit * 3,
    }),
    headline: {
        fontSize: "1.2rem",
        marginBottom: "1rem"
    },
    content: {
        whiteSpace: "pre"
    },
    footer: {
        display: "block",
        marginTop: "1rem",
        fontSize: "0.8rem",
        paddingTop: "1rem",
        borderTop: "1px solid #b1b1b1",
        color: "#b1b1b1"
    }
});

const OutputBox = ({content, apiStatus, newWords, classes}) => {

    // if (!content) {
    //     return <div />
    // }

    console.log(content)

    switch (apiStatus) {

        case apiConstants.STATUSES.OK:
            let contentContainer = <Typography component="p" className={classes.content}>
                {content}
            </Typography>;

            let paperFooter;
            if (newWords.length) {
                let newWordMessage
                if (newWords.length === 1) {
                    newWordMessage = `Hey you just taught me a new word! Thanks to you I know "${newWords[0]}"`
                } else {
                    newWordMessage = <span>
                        {"Thanks! You just taught me some new words: "}

                        {newWords.join(', ')}
                    </span>
                }
                paperFooter = <Typography className={classes.footer}>
                    {newWordMessage}
                </Typography>;
            }

            return <Paper className={classes.paper} elevation={4}>
                {/*<Typography component="h1" type="headline" className={classes.headline}>*/}
                    {/*Synonymized*/}
                {/*</Typography>*/}
                {contentContainer}
                {paperFooter}
            </Paper>


        case apiConstants.STATUSES.FETCHING:
            return <Progress />

        default:
            return <div />
    }
}

OutputBox.propTypes = {
    // content: PropTypes.string.isRequired
}

export default withStyles(styles)(OutputBox);