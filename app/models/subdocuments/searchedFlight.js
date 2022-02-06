const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlightDetails = require("./flightDetails");

const searchedFlight = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    select: false,
  },
  flights: {
    type: [FlightDetails],
    default: [],
  },
  code: {
    type: String,
    required: true,
  },
  searchedTime: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

module.exports = searchedFlight;
// module.exports = mongoose.model("searchedFlight", searchedFlight);