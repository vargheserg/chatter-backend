const express = require("express");
const verifyToken = require("../utils/verifyToken");
const Conversation = require("../models/conversationModel");
const ObjectId = require('mongodb').ObjectId;
const Users = require("../models/userModel");
const fetch = require("node-fetch");

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

    req.body.users.forEach((user) => {
        // Emits the event to the user to create the conversation
        bindConvoToUser(user.userId, newConversation._id, req.body.name);
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
        conversationId: newConversation._id,
    });
});

async function bindConvoToUser(userID, convoID, convoName) {
    return Users.updateOne(
        {
            _id: userID,
        },
        {
            $push: {
                conversations: {
                    conversationID: convoID,
                    conversationName: convoName,
                },
            },
        }
    );
}

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

    const user = await Users.findById(
        {
            _id: userID,
        },
        {
            username: 1, 
            _id: 0
        }
    );

   const updatedUser = await Conversation.updateOne(
        { _id: req.params.conversationId },
        { $push: { messages: {
            ...req.body,
            userID: userID,
            username: user.username,
         } } }
    );
    /*const updatedUser = await Conversation.findByIdAndUpdate(
        {_id: req.params.conversationId},
        {
            $push:
            {
            messages: req.body,
            },
        },
        {new: true}
    );*/

    // Return the inserted message id?
    pusher.trigger(req.params.conversationId, "message", {
        userID: userID,
        username: user.username,
        message: req.body.message
    });

    const uri = process.env.WITAI_URI + encodeURIComponent(req.body.message.message);
    const auth = 'Bearer ' + process.env.WITAI_KEY;

    let event = {};

    await fetch(uri, {headers: {Authorization: auth}})
     .then(res => res.json())
     .then((data) => {
        if (data.intents.length==1) {
            if(data.entities.hasOwnProperty('wit$location:location')) 
              event.location = data.entities['wit$location:location'][0]['value'];
            if(data.entities.hasOwnProperty('wit$datetime:datetime')) {
              if(data.entities['wit$datetime:datetime'][0].hasOwnProperty('from')) 
                event.datetime = new Date(data.entities['wit$datetime:datetime'][0]['from']['value']);
              else
                event.datetime = new Date(data.entities['wit$datetime:datetime'][0]['values'][0]['value']);
            }
            if(data.entities.hasOwnProperty('purpose:purpose'))
              event.purpose = (data.entities['purpose:purpose'][0]['value']);
            event.intent = data.intents[0]['name'];
          }
    });

    return res.status(200).json({
        message: "Message sent",
        event: event
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

    await Conversation.deleteOne({ _id: req.params.conversationId });
    return res.status(200).json({
        message: "Conversation Deleted",
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

router.get("/:conversationId", async function (req, res) {
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

    const conversation = await Conversation.findById(new ObjectId(req.params.conversationId));
    if (conversation == null) {
        return res.status(404).json({
            message: "Conversation does not exist",
        });
    }

    return res.status(200).json({
        ...conversation._doc,
    });
});

module.exports = router;
