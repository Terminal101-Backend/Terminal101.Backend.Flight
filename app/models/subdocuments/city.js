const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Airport = require("./airport");

const city = new Schema({
	name: {
		type: String,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
	airports: {
		type: [Airport],
		default: [],
	},
}, {
	timestamps: true
});

module.exports = city;