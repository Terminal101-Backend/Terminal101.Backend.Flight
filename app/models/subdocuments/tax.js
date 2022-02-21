const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tax = new Schema({
	amount: {
		type: Number,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
}, {
	timestamps: true
});

module.exports = tax;