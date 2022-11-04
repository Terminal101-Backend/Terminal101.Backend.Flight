const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { EBookedFlightStatus, ETravelClass, ERefund, EProvider } = require("../../constants");
const Person = require("../subdocuments/person");
const Contact = require("../subdocuments/contact");
const Segment = require("../subdocuments/segment");
const Status = require("../subdocuments/status");
const { generateRandomString } = require("../../helpers/stringHelper");

const bookedFlight = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
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
  providerTimeout: {
    type: Number,
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
  },
  providerName: EProvider.mongoField({ required: true }),
  businessCode: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

bookedFlight.pre("validate", async function (next) {
  const date = new Date();
  while (!this.code) {
    const code = "TL" + date.getMonth().toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0") + generateRandomString(4, 4, true, false, true);
    const user = await module.exports.findOne({ code });

    if (!user) {
      this.code = code;
    }
  }

  next();
});

module.exports = mongoose.model("bookedFlight", bookedFlight);