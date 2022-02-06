const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Waypoint = require("./waypoint");
const Airline = require("./airline");

const segment = new Schema({
  departure: {
    type: Waypoint,
    require: true,
  },
  arrival: {
    type: Waypoint,
    require: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  flightNumber: {
    type: String,
    required: true,
  },
  aircraft: {
    type: String,
    required: true,
  },
  airline: {
    type: Airline,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = segment;
// module.exports = mongoose.model("segment", segment);