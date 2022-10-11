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

    req.body.users.forEach(user => { // Emits the event to the user to create the conversation
        pusher.trigger(user.userId, "create-conversation", { 
            conversationId: newConversation._id,
            name: req.body.name,
            users: req.body.users, // Include the user that actually init the conv since its missing from this array?
        });
        // Won't ping the user that creates the convo - Frontend handles
    });
    
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

    pusher.trigger(req.params.conversationId, "message", req.body.message);

    return res.status(200).json({
        message: "Message Updated"
    });
});

module.exports = router;
