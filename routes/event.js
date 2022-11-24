const express = require("express");
const verifyToken = require("../utils/verifyToken");
const Event = require("../models/eventModel");
const ObjectId = require('mongodb').ObjectId;
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

    if (!req.body.name || !req.body.purpose || !req.body.location || !req.body.time || !req.body.conversationId || !req.body.details) {
        return res.status(400).json({
            message: "Invalid Request Missing Fields",
        });
    }
    const newEvent = new Event({
        conversationId: req.body.conversationId,
        name: req.body.name,
        purpose: req.body.purpose,
        location: req.body.location,
        time: req.body.time,
        details: req.body.details
    });
    await newEvent.save();

    return res.status(200).json({
        message: "Event Created",
        eventId: newEvent._id,
    });
});

router.put("/:eventId", async function (req, res) {
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

    if (!req.body.name || !req.body.purpose || !req.body.location || !req.body.time || !req.body.conversationId || !req.body.details) {
        return res.status(400).json({
            message: "Invalid Request",
        });
    }

    const updatedEvent = await Event.updateOne(
        { _id: req.params.eventId },
        {
            conversationId: req.body.conversationId,
            name: req.body.name,
            purpose: req.body.purpose,
            location: req.body.location,
            time: req.body.time,
            details: req.body.details
        }
    );

    return res.status(200).json({
        message: "Event Updated",
    });
});

router.delete("/:eventId", async function (req, res) {
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

    const doesExists = await Event.exists({
        _id: req.params.eventId,
    });

    if (!doesExists) {
        return res.status(404).json({
            message: "Event does not exist",
        });
    }

    await Event.deleteOne({ _id: req.params.eventId });
    return res.status(200).json({
        message: "Event Deleted",
    });
});

router.get("/:eventId", async function (req, res) {
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

    const event = await Event.findById(new ObjectId(req.params.eventId));
    if (event == null) {
        return res.status(404).json({
            message: "Event does not exist",
        });
    }

    return res.status(200).json({
        ...event._doc,
    });
});

router.get("/user/:userId", async function (req, res) {
    if (!req.headers.authorization) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }

    const userID = verifyToken(req.headers.authorization);
    if (!userID || userID != req.params.userId) {
        return res.status(440).json({
            message: "Invalid Credentials",
        });
    }

    var conversationIDList = await Conversation.find({"users.userId": new ObjectId(req.params.userId)})
    
    conversationIDList = conversationIDList.map(function (element) {
        return element._id;
    });
    var events = await Event.find({"conversationId": {$in :conversationIDList}})
    events = events
    .filter(event => new Date(event.time).toISOString() > new Date().toISOString() > 0)
    .sort((a,b) => a.date - b.date);

    if (events == null) {
        return res.status(404).json({
            message: "Events does not exist",
        });
    }

    return res.status(200).json({
        ...events,
    });
});

router.get("/conversation/:conversationId", async function (req, res) {
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

    var events = await Event.find({"conversationId": req.params.conversationId});
    events = events
    .filter(event => new Date(event.time).toISOString() > new Date().toISOString() > 0)
    .sort((a,b) => a.date - b.date);

    if (events == null) {
        return res.status(404).json({
            message: "Events does not exist",
        });
    }

    return res.status(200).json({
        ...events,
    });
});

module.exports = router;
