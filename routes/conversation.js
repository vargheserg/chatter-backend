var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
    res.send('GET handler for /conversation route.');
});

router.post('/', function(req, res) {
    res.send('POST handler for /conversation route.');
});

module.exports = router;