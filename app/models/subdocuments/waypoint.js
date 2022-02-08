const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Airport = require("./airport");
const City = require("./city");

const waypoint = new Schema({
  airport: {
    type: Airport,
    required: true,
  },
  city: {
    type: City,
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