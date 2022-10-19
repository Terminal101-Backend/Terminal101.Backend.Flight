const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Condition = require("../subdocuments/condition");

const commission = new Schema({
  code: {
    type: Number,
    required: true,
    index: true,
    unique: true,
  },
  origin: {
    type: Condition,
    default: {},
  },
  destination: {
    type: Condition,
    default: {},
  },
  airline: {
    type: Condition,
    default: {},
  },
  providerNames: {
    type: [String],
    default: [],
  },
  business: {
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

// module.exports = commission;
module.exports = mongoose.model("commission", commission);