const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Segment = require("./segment");

const itinerary = new Schema({
  segments: {
    type: [Segment],
    default: [],
  },
  duration: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = itinerary;
// module.exports = mongoose.model("itinerary", itinerary);