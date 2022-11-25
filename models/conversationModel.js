const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
    name: String,
    users: {
        type: [
            {
                userId: mongoose.Schema.Types.ObjectId,
                username: String,
            },
        ],
        default: [],
    },
    messages: {
        type: [
            {
                userId: mongoose.Schema.Types.ObjectId,
                username: String,
                message: String,
                timeSent: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
});

module.exports = mongoose.model("Conversation", conversationSchema);
