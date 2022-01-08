const app = require("./app");
const path = require("path");
const database = require("./app/core/db/mongo");

const server = app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running at port:${process.env.PORT}`);
});

const io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.log(`socket.io connected: ${socket.id}`);
});

database.startDatabase();

global.io = io;
