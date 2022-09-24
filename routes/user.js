var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
    res.send('GET handler for /user route.');
});

router.post('/', function(req, res) {
    res.send('POST handler for /user route.');
});

module.exports = router;