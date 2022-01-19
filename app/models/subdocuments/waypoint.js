const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const FlightInfo = require("./flightInfo");

const waypoint = new Schema({
  airportCode: {
    type: String,
    required: true,
  },
  terminal: {
    type: String,
    required: false,
  },
  at: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = waypoint;
// module.exports = mongoose.model("waypoint", waypoint);