const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Airport = require("./airport");
const Airline = require("./airline");

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
  priceFrom: {
    type: Number,
    required: true,
  },
  priceTo: {
    type: Number,
    required: true,
  },
  departureTimeFrom: {
    type: Number,
    required: true,
  },
  departureTimeTo: {
    type: Number,
    required: true,
  },
  arrivalTimeFrom: {
    type: Number,
    required: true,
  },
  arrivalTimeTo: {
    type: Number,
    required: true,
  },
  durationFrom: {
    type: Number,
    required: true,
  },
  durationTo: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = filterLimit;
// module.exports = mongoose.model("filterLimit", filterLimit);