const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { EBookedFlightStatus, ETravelClass, ERefund } = require("../../constants");
const Person = require("../subdocuments/person");
const Contact = require("../subdocuments/contact");
const Segment = require("../subdocuments/segment");
const Status = require("../subdocuments/status");

const bookedFlight = new Schema({
  code: {
    type: String,
    required: true,
  },
  bookedBy: {
    type: String,
    required: true,
  },
  flightSegments: {
    type: [Segment],
    default: [],
  },
  travelClass: ETravelClass.mongoField({ default: "ECONOMY" }),
  time: {
    type: Date,
    default: Date.now,
  },
  providerPnr: {
    type: String,
    required: false,
  },
  providerError: {
    type: String,
    required: false,
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
    // required: true,
  },
  contact: {
    type: Contact,
    default: {},
  },
  passengers: {
    type: [Person],
    default: [],
  },
  // status: EBookedFlightStatus.mongoField({
  //     default: "PAYING",
  // }),
  statuses: {
    type: [Status(EBookedFlightStatus, "PAYING")],
    default: [],
  },
  refundTo: ERefund.mongoField({ default: "WALLET" }),
  refundInfo: {
    type: String,
    required: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("bookedFlight", bookedFlight);