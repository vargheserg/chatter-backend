const User = require("../models/userModel");
const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const verifyToken = require("../utils/verifyToken");

const router = express.Router();

/*
    Return JWT for session?
    Update response message schema??
*/

router.post("/login", async function (req, res) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            message: "Invalid Request",
        });
    }

    const user = await User.findOne({
        username: req.body.username,
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    const hashedPassword = crypto
        .scryptSync(req.body.password, user.salt, 64)
        .toString("hex");

    if (hashedPassword !== user.password) {
        return res.status(401).json({
            // Not sure about the response code
            message: "Invalid password",
        });
    }

    const userID = user._id.toString();

    const token = jwt.sign(
        {
            userID: userID,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );

    res.status(201).json({
        message: "Success",
        token: token,
        id: userID,
    });
});

router.post("/signup", async function (req, res) {
    if (!req.body.name || !req.body.username || !req.body.password) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }

    const doesExists = await User.exists({
        username: req.body.username,
    });

    if (doesExists) {
        return res.status(409).json({
            // Not sure about the response code
            message: "Username exists",
        });
    }

    const salt = crypto.randomBytes(16).toString("hex");

    const hashedPassword = crypto
        .scryptSync(req.body.password, salt, 64)
        .toString("hex");

    const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        salt: salt,
        password: hashedPassword,
        status: "online",
    });
    await newUser.save();

    const userID = newUser._id.toString();

    const token = jwt.sign(
        {
            userID: userID,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );

    res.status(201).json({
        message: "Success",
        token: token,
    });
});

router.delete("/:userId", async function (req, res) {
    const doesExists = await User.exists({
        _id: req.params.userId,
    });

    if (!doesExists) {
        return res.status(404).json({
            message: "User does not exist",
        });
    }
    await User.deleteOne({_id: req.params.userId});

    res.status(200).json({
        message: "Success",
    });
});

function createMissingParamMessage(res, missingValue) {
    return res.status(400).json({
        error: `Invalid Request - Missing ${missingValue}`,
    });
}

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
