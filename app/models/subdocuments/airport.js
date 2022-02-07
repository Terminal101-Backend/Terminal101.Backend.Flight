const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Location = require("./location");

const airport = new Schema({
	name: {
		type: String,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: false,
	},
	// searchedCount: {
	// 	type: Number,
	// 	default: 0,
	// },
	// selectedCount: {
	// 	type: Number,
	// 	default: 0,
	// },
	location: {
		type: Location,
		required: false,
	},
}, {
	timestamps: true
});

module.exports = airport;