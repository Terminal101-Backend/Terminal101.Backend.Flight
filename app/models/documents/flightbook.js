const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { EFlightBookType } = require("../../constants");

const flightBook = new Schema({
    flightOrderId: {
        type: String,
        required: true,
        unique: true
    },
    flightCode: {
        type: String,
        required: true,
    },
    bookedBy: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status: EFlightBookType.mongoField({
        required: true,
        default: "INPROGRESS"
    }),
    transactionId: {
        type: String
    },
    paymentMethod: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("flightBook", flightBook);