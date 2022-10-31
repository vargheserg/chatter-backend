const Pusher = require("pusher-js"); // Import
const PusherAppKey = "abe185cdca80fe92b3cb";

const pusher = new Pusher(PusherAppKey, {
    cluster: "us2",
    encrypted: true,
    forceTLS: true,
});

pusher.connection.bind("connected", () => {
    console.log("Websocket Connected");
});

pusher.connection.bind("unavailable", () => {
    console.log("Websocket Disconnected");
});

const channel = pusher.subscribe("6345daac2f7844c1be088e2c");

channel.bind("user-event", function (data) {
    switch (data.eventType) {
        case "create-conversation":
            createConversationBind(data.conversationId);
            break;
    }
    console.log(data);
});

function createConversationBind(channelID) {
    const conversationChannel = pusher.subscribe(channelID);
    conversationChannel.bind("message", function (data) {
        console.log(data);
    });
    conversationChannel.bind("status", function (data) {
        console.log(data);
    });
};