let first;

module.exports = (io, socket) => {
  socket.on("test message", msg => {
    console.log(msg);
    if (!first) {
      first = socket.id;
    }

    // socket.emit("tm", "HHH");
    socket.to(first).emit("tm", "LLL");
    // socket.disconnect();
  });
};
