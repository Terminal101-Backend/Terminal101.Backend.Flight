const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SearchedFlight = require("../subdocuments/searchedFlight");

const flightInfo = new Schema({
    originCode: {
        type: String,
        required: true,
    },
    destinationCode: {
        type: String,
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
    searches: {
        type: [SearchedFlight],
        default: [],
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("flightInfo", flightInfo);