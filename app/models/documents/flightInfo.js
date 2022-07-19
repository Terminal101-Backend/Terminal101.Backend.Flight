const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const SearchedFlight = require("../subdocuments/searchedFlight");
const Location = require("../subdocuments/location");
const FlightDetails = require("../subdocuments/flightDetails");
const FilterLimit = require("../subdocuments/filterLimit");

const flightInfo = new Schema({
    origin: {
        type: Location,
        required: true,
    },
    destination: {
        type: Location,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    // searchedCount: {
    //     type: Number,
    //     default: 0,
    // },
    // selectedCount: {
    //     type: Number,
    //     default: 0,
    // },
    // searches: {
    //     type: [SearchedFlight],
    //     default: [],
    // }
    flights: {
        type: [FlightDetails],
        default: [],
    },
    filter: {
        type: FilterLimit,
        default: {},
    },
    code: {
        type: String,
        required: true,
    },
    searchedTime: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("flightInfo", flightInfo);