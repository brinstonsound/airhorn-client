# specify the node base image with your desired version node:<version>
FROM node:11
WORKDIR /app
COPY package.json /app
RUN npm install
COPY ./public /app/public
COPY ./src /app/src
CMD node ./src/main.js
EXPOSE 8080
