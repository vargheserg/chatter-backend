const mongoose = require('mongoose')

const conversationSchema = mongoose.Schema({
    name: String,
    userList: {
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
                message: String,
                timeSent: Date,
            },
        ],
        default: [],
    },
})

module.exports = mongoose.model('Conversation', conversationSchema)
