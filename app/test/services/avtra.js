const { expect } = require("@jest/globals");
const { avtra } = require("../../services");

module.exports.ping = async done => {
  try {
    const response = await avtra.ping();

    console.log(response);

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.lowFareSearch = async done => {
  try {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 5);
    const response = await avtra.lowFareSearch("BGW", "SAW", departureDate.toISOString().split("T")[0]);

    console.log(response);

    done();
  } catch (err) {
    done(err);
  }
};
