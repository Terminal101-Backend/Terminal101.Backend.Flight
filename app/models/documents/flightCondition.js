const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Condition = require("../subdocuments/condition");

const flightCondition = new Schema({
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
    isRestricted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("flightCondition", flightCondition);