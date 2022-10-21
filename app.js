const express = require("express");
const user = require("./routes/user");
const conversation = require("./routes/conversation");
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors())

var env = process.env.NODE_ENV || 'development';

if(env == "development"){
    require("dotenv").config()
}

const port = process.env.PORT || 3000;

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const mongoose = require("mongoose");

const CONNECTION_URI = process.env.MONGODB_URI || "mongodb://localhost/chatter";
mongoose.connect(CONNECTION_URI, (err) => {
    if (err) {
        console.log(err);
    }
});

const options = {
    definition: {
        servers: [
            {
                url: `${process.env.URL}`.concat(":", port),
            },
        ],
    },
    apis: ["./routes/*.js"],
};

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        explorer: true,
    })
);
app.use("/user", user);
app.use("/conversation", conversation);

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
