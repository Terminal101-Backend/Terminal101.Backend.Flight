const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Condition = require("../subdocuments/condition");
const CommissionValue = require("../subdocuments/commissionValue");

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
  member: {
    type: Condition,
    default: {},
  },
  business: {
    type: Condition,
    default: {},
  },
  value: {
    type: CommissionValue,
    default: {},
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