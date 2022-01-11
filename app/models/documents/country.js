const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { City, Airline } = require("../subdocuments");

const country = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    dialingCode: {
        type: Number,
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
    cities: {
        type: [City],
        required: true,
    },
    airlines: {
        type: [Airline],
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("country", country);