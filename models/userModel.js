const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    salt: String,
    password: String,
    status: String,
    friendList: {
        type: [
            {
                userId: mongoose.Schema.Types.ObjectId,
                username: String,
            },
        ],
        default: [],
    },
    blockList: {
        type: [
            {
                userId: mongoose.Schema.Types.ObjectId,
                username: String,
            },
        ],
        default: [],
    },
    conversations: {
        type: [
            {
                conversationID: String,
                conversationName: String,
            },
        ],
        default: [],
    },
});

module.exports = mongoose.model("User", userSchema);
