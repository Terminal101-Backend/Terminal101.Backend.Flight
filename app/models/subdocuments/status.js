const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * 
 * @param {Enum} statusType 
 * @param {String} defaultValue 
 * @returns {Schema}
 */
const status = (statusType, defaultValue) => new Schema({
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

module.exports = status;