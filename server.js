const app = require("./app");
const path = require("path");
const mongo = require("./app/core/db/mongo");
// const redis = require("./app/core/db/redis");
const socketMessages = require("./app/socket");

const server = app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at port:${process.env.PORT}`);
});

const io = require('socket.io')(server, {
  cors: {
    // origin: "https://test-terminal101-flight.herokuapp.com/",
    origin: "*",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on('connection', function (socket) {
  console.log(`User connected: ${socket.id}`);

  socketMessages(global.io, socket);
});

mongo.startDatabase();
// redis.startDatabase();

// global.io = io;
