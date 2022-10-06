const User = require("../models/userModel");
const express = require("express");
const verifyToken = require("../utils/verifyToken");

const router = express.Router();

router.put("/updateStatus", async function (req, res) {
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

    await User.updateOne({_id:userID},{$set: {status: req.body.status}});

    
    return res.status(200).json({
        message: "Status updated",
    });
});

module.exports = router;