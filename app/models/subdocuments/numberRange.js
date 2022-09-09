const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const filterLimit = new Schema({

  min: {
    type: Number,
    default: Number.NEGATIVE_INFINITY,
  },
  max: {
    type: Number,
    default: Number.POSITIVE_INFINITY,
  },
}, {
  timestamps: true
});

module.exports = filterLimit;
// module.exports = mongoose.model("filterLimit", filterLimit);