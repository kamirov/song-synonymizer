# Song Synonymizer

Song Synonymizer is a Node React-Redux app that takes song or poem lyrics and replaces the words with synonyms. There are some flags users can set (e.g. "preserve line rhyme", "preserve word syllable count"), and some heuristics on the backend that try to improve the synonymizations.


## Installation

- Create `.env` file in `backend/` (follow `.env.example`). Fill in
- Get a Mashape API key for the [Words API](https://www.wordsapi.com) and set it as `X_MASHAPE_KEY` in `.env`
- Modify the environment variables in `docker-compose.yml` if you like (note, you'll likely have to change the corresponding variables in `.env`)
- Navigate to the app root and type `docker-compose up`


## Known client bugs

- Looks ugly on mobile views
- Can enter blank lines and submit

## Known server bugs

- ~~Occasionally "preserve word syllables" flag doesn't actually preserve word syllables. I haven't picked up a pattern yet, but saw it happening with "man" ("mankind" has the same number of syllables as "man", app? really?) and a couple of others I can't recall~~ Nevermind, this was a data issue. Some data from the Words API is just jenkem

## To-(but-probably-won't)-do

- ~Finish "preserve line syllable" feature~
- Clean up SynonymService (it's like a bar washroom at 1am in there). There's some functions that should be extracted into separate utility services, some that should be put into one of the existing services, documentation that's needed, etc.
- I think we're hitting the DB too often. A few optimizations to make:
    - In add-words, we should parse text and do a where-in query for any of the words in the text block. Currently we do a separate select for each word
    - In add-words we should bulk insert synonym relationships. Currently we insert each separately
    - In synonymization, we should get all synonyms per line in a single query. Unsure of the query off the bat, but I'm sure there is one
- Simplify deployment process. Right now, variables are housed in either `docker-compose.yml` or `.env`. They should be consolidated
