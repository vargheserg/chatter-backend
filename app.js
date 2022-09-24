var express = require('express'),
    user    = require('./routes/user'),
    conversation = require('./routes/conversation');

const app = express()
const port = 3000

app.use('/user',  user);
app.use('/conversation',  conversation);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })