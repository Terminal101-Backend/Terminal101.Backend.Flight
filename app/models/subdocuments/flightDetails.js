const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Itinerary = require("./itinerary");

const flightDetails = new Schema({
  itineraries: {
    type: [Itinerary],
    default: [],
  },
  currencyCode: {
    type: String,
    default: "USD",
  },
  price: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = flightDetails;
// module.exports = mongoose.model("flightDetails", flightDetails);