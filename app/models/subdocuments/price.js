const mongoose = require("mongoose");
const Fee = require("./fee");
const PriceDetails = require("./priceDetails");
const Tax = require("./tax");
const Schema = mongoose.Schema;

const price = new Schema({

	total: {
		type: Number,
		required: true,
	},
	grandTotal: {
		type: Number,
		required: true,
	},
	base: {
		type: Number,
		required: true,
	},
	travelerPrices: {
		type: [PriceDetails],
		default: [],
	},
	fees: {
		type: [Fee],
		default: [],
	},
	taxes: {
		type: [Tax],
		default: [],
	},
}, {
	timestamps: true
});

module.exports = price;