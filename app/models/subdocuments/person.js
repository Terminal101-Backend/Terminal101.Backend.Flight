const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const person = new Schema({

	documentCode: {
		type: String,
		required: true,
	},
	documentIssuedAt: {
		type: String,
		required: true,
	},
}, {
	timestamps: true
});

module.exports = person;