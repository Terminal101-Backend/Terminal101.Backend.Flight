const flightInfoMessages = require("./flightInfoMessages");

module.exports = (io, socket) => {
  flightInfoMessages(io, socket);
};
