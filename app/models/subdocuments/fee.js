const mongoose = require("mongoose");
const { EFeeType } = require("../../constants");
const Schema = mongoose.Schema;

const fee = new Schema({
	amount: {
		type: Number,
		required: true,
	},
	type: EFeeType.mongoField({
		required: true,
	}),
}, {
	timestamps: true
});

module.exports = fee;