const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const condition = new Schema({
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

module.exports = condition;
// module.exports = mongoose.model("condition", condition);