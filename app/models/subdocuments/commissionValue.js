const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commissionValue = new Schema({
  percent: {
    type: Number,
    default: 0,
  },
  constant: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

module.exports = commissionValue;
// module.exports = mongoose.model("commissionValue", commissionValue);