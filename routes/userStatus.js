const User = require("../models/userModel");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.put("/", async function (req, res) {
    if (!req.headers.authorization) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }

    const userID = verifyToken(req.headers.authorization);

    if (!userID) {
        return res.status(440).json({
            message: "Invalid Credentials",
        });
    }

    if (!req.body.status) {
        return res.status(400).json({
            message: "Invalid Request",
        });
    }

    User.findByIdAndUpdate(userID, {
        status: req.body.status,
    });
});

module.exports = router;