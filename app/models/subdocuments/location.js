const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Point = require("./point");

const location = new Schema({
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
	point: {
		type: Point,
		required: false,
	},
}, {
	timestamps: true
});

module.exports = location;