var express = require('express'),
    user    = require('./routes/user'),
    conversation = require('./routes/conversation');

const app = express()
const port = 3000

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const options = {
    definition: {
      servers: [
        {
          url: `${process.env.URL}`.concat(":", port),
        },
      ],
    },
    apis: ["./routes/*.js"],
  };

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.use('/user',  user);
app.use('/conversation',  conversation);

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })