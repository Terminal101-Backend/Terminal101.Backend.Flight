const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Location = require("./location");

/**
 * 
 * @param {Enum} statusType 
 * @param {String} defaultValue 
 * @returns {Schema}
 */
const city = (statusType, defaultValue) => new Schema({
	status: statusType.mongoField({ required: true, default: defaultValue }),
	time: {
		type: Date,
		default: new Date(),
	},
	description: {
		type: String,
		default: "",
	},
	changedBy: {
		type: String,
		required: true,
	}
}, {
	timestamps: true
});

module.exports = city;