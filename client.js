const Pusher = require('pusher-js');
const PusherAppKey = "abe185cdca80fe92b3cb";

global.pusher = new Pusher(PusherAppKey, {
  cluster: "us2",
  encrypted: true,
  forceTLS: true,
});

pusher.connection.bind('connected', () => {
  console.log("Websocket Connected");
});

pusher.connection.bind('unavailable', () => {
  console.log("Websocket Disconnected");
});

const channel = pusher.subscribe("6345daac2f7844c1be088e2c");

channel.bind("create-conversation", function(data) {
  console.log(data)
  createConversationBind(data.conversationId)
});

function createConversationBind(channelID) {
  const conversationChannel = pusher.subscribe(channelID);
  conversationChannel.bind("message", function(data) {
    console.log(data)
  })
}