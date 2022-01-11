const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const FlightInfo = require("./flightInfo");

const searchedFlight = new Schema({
    // flight: {
    //     type: ObjectId,
    //     ref: FlightInfo,
    //     required: true,
    // },
    flightTime: {
        type: Date,
        required: true,
    },
    searchedTime: {
        type: Date,
        default: Date.now(),
    },
    price: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});

// module.exports = mongoose.model("searchedFlight", searchedFlight);