const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Waypoint = require("./waypoint");

const segment = new Schema({
  departure: {
    type: Waypoint,
    default: [],
  },
  arrival: {
    type: Waypoint,
    default: [],
  },
  duration: {
    type: Number,
    required: true,
  },
  aircraftCode: {
    type: String,
    required: true,
  },
  airlineCode: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = segment;
// module.exports = mongoose.model("segment", segment);