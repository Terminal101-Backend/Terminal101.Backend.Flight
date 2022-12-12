process.on("uncaughtException", function (err) {
  let time = new Date().toString();
  console.trace(`At ${time}`, err);
});

global.config = require("./app/config");
const app = require("./app");
const path = require("path");
const mongo = require("./app/core/db/mongo");
// const redis = require("./app/core/db/redis");
// const socketMessages = require("./app/socket");
const socket = require("./app/helpers/socketHelper");

const server = app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at port:${process.env.PORT}`);
});

socket.initialize(server);
mongo.startDatabase();
// redis.startDatabase();
