const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const flightInfo = new Schema({
    fromAirportId: {
        type: String,
        required: true,
    },
    toAirportId: {
        type: String,
        required: true,
    },
    airlineId: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    searchedCount: {
        type: Number,
        default: 0,
    },
    selectedCount: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("flightInfo", flightInfo);