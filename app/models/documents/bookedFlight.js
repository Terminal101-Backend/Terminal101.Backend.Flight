const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { EBookedFlightStatus } = require("../../constants");
const Person = require("../subdocuments/person");
const Contact = require("../subdocuments/contact");

const bookedFlight = new Schema({

    code: {
        type: String,
        required: true,
    },
    bookedBy: {
        type: String,
        required: true,
    },
    // origin: {
    //     type: String,
    //     required: true,
    // },
    // destination: {
    //     type: String,
    //     required: true,
    // },
    time: {
        type: Date,
        default: Date.now,
    },
    searchedFlightCode: {
        type: String,
        required: true,
    },
    flightDetailsCode: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    contact: {
        type: Contact,
        default: {},
    },
    passengers: {
        type: [Person],
        default: [],
    },
    status: EBookedFlightStatus.mongoField({
        default: "PAYING",
    }),
}, {
    timestamps: true
});

module.exports = mongoose.model("bookedFlight", bookedFlight);