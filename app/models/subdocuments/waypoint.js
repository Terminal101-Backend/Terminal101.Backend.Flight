const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Location = require("./location");

const waypoint = new Schema({
  airport: {
    type: Location,
    required: true,
  },
  city: {
    type: Location,
    required: true,
  },
  country: {
    type: Location,
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