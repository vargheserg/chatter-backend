const express = require("express");
const verifyToken = require("../utils/verifyToken");
const Conversation = require("../models/conversationModel");
const ObjectId = require('mongodb').ObjectId;

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
        pusher.trigger(user.userId, "user-event", { 
            eventType: "create-conversation",
            conversationId: newConversation._id,
            name: req.body.name,
            users: req.body.users,
        });
        // Won't ping the user that creates the convo - Frontend handles?
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
    // Return the inserted message id?
    pusher.trigger(req.params.conversationId, "message", req.body.message);

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

router.get("/messages/:conversationId/", async function (req, res) {
    if (!req.headers.authorization) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }
    timeSent = req.query.timeSentBefore;
    var timeSentFilter;
    if(timeSent == undefined || !timeSent) {
        timeSentFilter = new Date()
    } else {
        timeSentFilter = new Date(timeSent);
    }

    size = parseInt(req.query.size);
    if(size == undefined || !size) {
        size = 10;
    }

    const userID = verifyToken(req.headers.authorization);
    if (!userID) {
        return res.status(440).json({
            message: "Invalid Credentials",
        });
    }

    const conversation = await Conversation.aggregate([
        { $match: {_id: new ObjectId(req.params.conversationId)}},
        { $project: {
            messages: {$filter: {
                input: '$messages',
                as: 'message',
                limit: size,
                cond: {$lte: ['$$message.timeSent', timeSentFilter]}
            }}
        }}
    ])

      if (conversation == null) {
        return res.status(404).json({
          message: "Conversation does not exist",
        });
      }
    
    
    
    
      return res.status(200).json(conversation);
});

router.get("/:conversationId/", async function (req, res) {
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

    const conversation = await Conversation.find( {_id: req.path.conversationId});
    if (conversation == null) {
        return res.status(404).json({
            message: "Conversation does not exist",
        });
    }

    return res.status(200).json({
        ...conversation._doc
    });
});

router.get("/messages/:conversationId/", async function (req, res) {
    if (!req.headers.authorization) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }
    var timeSentBefore = req.body.timeSentBefore;
    if(timeSentBefore == null) {
        timeSentBefore = new Date();
    }

    const userID = verifyToken(req.headers.authorization);
    if (!userID) {
        return res.status(440).json({
            message: "Invalid Credentials",
        });
    }

    const conversation = await Conversation.find( {_id: req.path.conversationId, messages: {timeSent: { $lte: timeSentBefore }}})
    .limit( 10 )
    .sort( '-timeSent' );

    if (conversation == null) {
        return res.status(404).json({
            message: "Conversation does not exist",
        });
    }

    

    
    return res.status(200).json({
        ...conversation._doc
    });
});

module.exports = router;
