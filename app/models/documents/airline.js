const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Point = require("../subdocuments/point");

const airline = new Schema({
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
	headOfficeLocation: {
		type: Point,
		required: false,
	},
}, {
	timestamps: true
});

module.exports = mongoose.model("airline", airline);
