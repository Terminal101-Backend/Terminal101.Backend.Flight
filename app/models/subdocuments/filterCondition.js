const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Location = require("./location");

const filterCondition = new Schema({
  exclude: {
    type: Boolean,
    default: false,
  },
  items: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true
});

module.exports = filterCondition;
// module.exports = mongoose.model("filterCondition", filterCondition);