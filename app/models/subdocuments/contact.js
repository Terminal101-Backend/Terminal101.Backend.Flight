const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const person = new Schema({

	email: {
		type: String,
		required: true,
	},
	mobileNumber: {
		type: String,
		required: true,
	},
}, {
	timestamps: true
});

module.exports = person;