const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Itinerary = require("./itinerary");
const { ETravelClass, EProvider } = require("../../constants");
const Price = require("./price");

const flightDetails = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    select: false,
  },
  code: {
    type: Number,
    required: true,
  },
  itineraries: {
    type: [Itinerary],
    default: [],
  },
  currencyCode: {
    type: String,
    default: "USD",
  },
  price: {
    type: Price,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  travelClass: ETravelClass.mongoField({ required: true }),
  provider: EProvider.mongoField({ required: true }),
}, {
  timestamps: true
});

module.exports = flightDetails;
// module.exports = mongoose.model("flightDetails", flightDetails);