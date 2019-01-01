#!/bin/sh
echo Enabling external configs...
cp vue.config.external.js vue.config.js
cp ./src/appSettings.external.js ./src/appSettings.js
echo Building Docker image...
docker build -t airhorn-client-external .
echo Restoring local configs...
cp vue.config.local.js vue.config.js
cp ./src/appSettings.local.js ./src/appSettings.js
echo Done!