const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Airport = require("./airport");
const Location = require("./location");
const NumberRange = require("./numberRange");

const filterLimit = new Schema({
  stops: {
    type: [Number],
    default: [0],
  },
  aircrafts: {
    type: [String],
    default: [],
  },
  airports: {
    type: [Airport],
    default: [],
  },
  airlines: {
    type: [Location],
    default: [],
  },
  price: {
    type: NumberRange,
    default: {},
  },
  departureTime: {
    type: NumberRange,
    default: {},
  },
  arrivalTime: {
    type: NumberRange,
    default: {},
  },
  duration: {
    type: NumberRange,
    default: {},
  },
}, {
  timestamps: true
});

module.exports = filterLimit;
// module.exports = mongoose.model("filterLimit", filterLimit);