const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Airport = require("./airport");
const Airline = require("./airline");
const NumberRange = require("./numberRange");

const filterLimit = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    select: false,
  },
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
    type: [Airline],
    default: [],
  },
  price: {
    type: NumberRange,
    required: true,
  },
  departureTime: {
    type: NumberRange,
    required: true,
  },
  arrivalTime: {
    type: NumberRange,
    required: true,
  },
  duration: {
    type: NumberRange,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = filterLimit;
// module.exports = mongoose.model("filterLimit", filterLimit);