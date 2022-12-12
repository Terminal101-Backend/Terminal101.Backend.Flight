const mongoose = require("mongoose");
const { ETravelClass, ETravelerType } = require("../../constants");
const Fee = require("./fee");
const Tax = require("./tax");
const Schema = mongoose.Schema;

const priceDetails = new Schema({

	total: {
		type: Number,
		required: true,
	},
	base: {
		type: Number,
		required: true,
	},
	// travelClass: ETravelClass.mongoField({
	// 	required: true,
	// }),
	travelerType: ETravelerType.mongoField({
		required: true,
	}),
	count: {
		type: Number,
		default: 1,
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

module.exports = priceDetails;