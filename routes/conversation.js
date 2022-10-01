const express = require('express')
const verifyToken = require('../utils/verifyToken')

const router = express.Router()

router.post('/', function (req, res) {
    if (!req.headers.authorization) {
        return res.status(400).json({
            message: 'Invalid request',
        })
    }

    const userID = verifyToken(req.headers.authorization)

    if (!userID) {
        return res.status(440).json({
            message: 'Invalid Credentials',
        })
    }
})

module.exports = router
