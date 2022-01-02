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
		required: true,
	},
	headOfficeLocation: {
		type: Location,
		required: true,
	},
}, {
	timestamps: true
});

module.exports = airport;