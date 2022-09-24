# chatter-backend
A messenger/chat application server built on Node.JS

## Local Development Set Up
After having Node.js and NPM installed, run `npm install` on the base folder to get the dependencies of this proejct.

Install Docker as the local environment requires a mongoDB container for data. Upon installing, run `docker-compose up -d` in the base folder to run this instace.

After this, run `npm start` to find the local server on __localhost:3000__

## API Documentation
Go to the base URL of the server, and use the route __/api-docs__.

In the case of a local environment, this would be __localhost:3000/api-docs__

