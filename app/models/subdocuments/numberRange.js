const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Airport = require("./airport");
const Airline = require("./airline");

const filterLimit = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    select: false,
  },
  min: {
    type: Number,
    default: Number.NEGATIVE_INFINITY,
  },
  max: {
    type: Number,
    default: Number.POSITIVE_INFINITY,
  },
}, {
  timestamps: true
});

module.exports = filterLimit;
// module.exports = mongoose.model("filterLimit", filterLimit);