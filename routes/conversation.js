const express = require("express");
const verifyToken = require("../utils/verifyToken");
const Conversation = require("../models/conversationModel");

const router = express.Router();

router.post("/", async function (req, res) {
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

    if (!req.body.name || !req.body.users) {
        return res.status(400).json({
            message: "Invalid Request",
        });
    }
    const newConversation = new Conversation({
        name: req.body.name,
        users: req.body.users,
    });
    await newConversation.save();
    return res.status(200).json({
        message: "Conversation Created",
        conversationId: newConversation._id
    });
});

router.put("/:conversationId", async function (req, res) {
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

    if (!req.body.message) {
        return res.status(400).json({
            message: "Invalid Request",
        });
    }

    await Conversation.updateOne({_id: req.params.conversationId}, {$push: {messages: req.body.message}});
    return res.status(200).json({
        message: "Message Updated"
    });
});

router.delete("/:conversationId", async function (req, res) {
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

    const doesExists = await Conversation.exists({
        _id: req.params.conversationId,
    });

    if (!doesExists) {
        return res.status(404).json({
            message: "Conversation does not exist",
        });
    }

    await Conversation.deleteOne({_id: req.params.conversationId});
    return res.status(200).json({
        message: "Conversation Deleted"
    });
});

module.exports = router;
