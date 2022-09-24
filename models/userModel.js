const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  name: String,
  username: String,
  salt: String,
  password: String,
  friendList: {
    type: [{
      userID: String,
      username: String
    }],
    default: []
  },
  blockList: {
    type: [{
      userID: String,
      username: String
    }],
    default: []
  },
  conversations: {
    type: [{
      conversationID: String,
      conversationName: String
    }],
    default: []
  }
});

module.exports = mongoose.model('User', userSchema);