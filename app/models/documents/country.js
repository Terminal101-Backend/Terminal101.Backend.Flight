const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { City } = require("../subdocuments");

const country = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    cities: {
        type: [City],
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("country", country);