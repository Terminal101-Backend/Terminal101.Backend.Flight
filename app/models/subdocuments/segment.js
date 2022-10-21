const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Waypoint = require("./waypoint");
const Stop = require("./stop");
const Location = require("./location");

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
    default: "",
  },
  airline: {
    type: Location,
    required: true,
  },
  stops: {
    type: [Stop],
    default: [],
  },
  baggage: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = segment;
// module.exports = mongoose.model("segment", segment);