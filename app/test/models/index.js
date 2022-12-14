const { expect } = require("@jest/globals");
const db = require("../../core/db/mongo")
require("../..");

module.exports = {
  ...require("./country"),
  ...require("./flightCondition"),
};

module.exports.startDbConnection = async done => {
  try {
    var mongoose = require("mongoose");
    await db.startDatabase();
    expect(mongoose.connection.readyState).toBe(1);

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.stopDbConnection = async done => {
  try {
    await db.stopDatabase();

    done();
  } catch (err) {
    done(err);
  }
};
