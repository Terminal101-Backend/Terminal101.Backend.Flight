const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Condition = require("./condition");

const commission = new Schema({
  businesses: {
    type: Condition,
    default: {},
  },
  value: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

module.exports = commission;
// module.exports = mongoose.model("commision", commision);