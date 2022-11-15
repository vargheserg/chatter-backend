const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
    name: String,
    users: {
        type: [
            {
                userID: mongoose.Schema.Types.ObjectId,
                username: String,
            },
        ],
        default: [],
    },
    messages: {
        type: [
            {
                userID: mongoose.Schema.Types.ObjectId,
                username: String,
                message: String,
                timeSent: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
});

module.exports = mongoose.model("Conversation", conversationSchema);
