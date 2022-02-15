const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Location = require("./location");

const stop = new Schema({
  description: {
    type: String,
    required: false,
  },
  airport: {
    type: Location,
    required: true,
  },
  city: {
    type: Location,
    required: true,
  },
  country: {
    type: Location,
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