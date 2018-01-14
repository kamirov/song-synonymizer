export default {
    STATUSES: {
        NONE: "none",
        FETCHING: "fetching",
        OK: "ok",
        ERROR: "error",
        LIMIT: "limit"
    },
    MESSAGES: {
        FETCHING: [
            "Synonymizing...",
            "Synonymizing...taking a while...",
            "Synonymizing...this probably means we're learning a lot of new words...",
            "Synonymizing...sure is taking it's sweet time...",
            "Synonymizing...I'm sure it's almost done...",
            "Synonymizing...any day now...",
            "Synonymizing...oh it's done!",
            "Synonymizing...wait no...",
            "Synonymizing...ok I'm sure it's there...",
        ],
        ERROR: "Sorry, something went wrong on our end. Please try again (or send Andrei an angry message).",
        LIMIT: "Sorry, done for the day. Please try again tomorrow (daily external API limit exceeded. Andrei's not paying for the premium version. He mistreats me)"
    },
}