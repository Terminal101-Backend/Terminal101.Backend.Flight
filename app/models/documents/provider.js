const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { EProvider } = require("../../constants");

const provider = new Schema({

    name: EProvider.mongoField({ required: true }),
    title: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("provider", provider);