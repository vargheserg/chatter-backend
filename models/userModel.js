const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    salt: String,
    password: String,
    friendList: {
        type: [
            {
                userID: mongoose.Schema.Types.ObjectId,
                username: String,
            },
        ],
        default: [],
    },
    blockList: {
        type: [
            {
                userID: mongoose.Schema.Types.ObjectId,
                username: String,
            },
        ],
        default: [],
    },
    conversations: {
        type: [
            {
                conversationID: mongoose.Schema.Types.ObjectId,
                conversationName: String,
            },
        ],
        default: [],
    },
})

module.exports = mongoose.model('User', userSchema)
