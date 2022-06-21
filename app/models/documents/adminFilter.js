const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FilterCondition = require("../subdocuments");

const adminFilter = new Schema({
    origins: {
        type: FilterCondition,
        default: new FilterCondition(),
    },
    destination: {
        type: FilterCondition,
        default: new FilterCondition(),
    },
    airlines: {
        type: FilterCondition,
        default: new FilterCondition(),
    },
    providerNames: {
        type: [String],
        default: [],
    },
    isRestricted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("adminFilter", adminFilter);