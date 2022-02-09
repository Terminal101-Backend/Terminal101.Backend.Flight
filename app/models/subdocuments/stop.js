const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Airport = require("./airport");
const City = require("./city");

const stop = new Schema({
  description: {
    type: String,
    required: false,
  },
  airport: {
    type: Airport,
    required: true,
  },
  city: {
    type: City,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  arrivalAt: {
    type: Date,
    required: true,
  },
  departureAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = stop;
// module.exports = mongoose.model("stop", stop);