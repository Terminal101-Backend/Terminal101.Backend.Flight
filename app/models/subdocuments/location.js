const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const airport = new Schema({
	latitude: {
		type: Number,
		required: true,
	},
	longitude: {
		type: Number,
		required: true,
	},
}, {
	timestamps: true
});

module.exports = airport;