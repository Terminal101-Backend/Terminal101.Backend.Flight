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
	searchedCount: {
		type: Number,
		default: 0,
	},
	selectedCount: {
		type: Number,
		default: 0,
	},
	airports: {
		type: [Airport],
		default: [],
	},
}, {
	timestamps: true
});

module.exports = city;