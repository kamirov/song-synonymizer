#!/bin/bash

# Replace server port (keeps us consistently defining ports in docker-compose file)
sed -i -e "s/PORT=.*/PORT=$PORT/g" .env

# Check for .env file
if [[ -z "$(ls -A $PWD | grep .env)" ]]; then
	echo "no .env file found."
	exit 1
fi

npm install

# Add symbolic link (needed to let "require" calls work, which are needed for Intellisense)
ln -sf /app/app ./node_modules/App

# start app
source .env
if [[ "$NODE_ENV" == "production" ]]; then
	adonis serve
else
	adonis serve --dev
fi
