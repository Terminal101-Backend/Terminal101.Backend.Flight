const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FlightDetails = require("./flightDetails");
const FilterLimit = require("./filterLimit");

const searchedFlight = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    select: false,
  },
  flights: {
    type: [FlightDetails],
    default: [],
  },
  filter: {
    type: FilterLimit,
    required: true,
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