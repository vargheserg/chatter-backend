const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
    conversationId: mongoose.Schema.Types.ObjectId,
    details: String,
    purpose: String,
    name: String,
    location: String,
    time: { type: Date },
});

module.exports = mongoose.model("Event", eventSchema);
