const { expect } = require("@jest/globals");
const { ip } = require("../../services");

module.exports.getIpInfo = async done => {
  try {
    const response = await ip.getIpInfo("24.48.0.1");

    expect(response).toEqual(expect.objectContaining({
      "query": "24.48.0.1",
      "status": "success",
      "country": "Canada",
      "countryCode": "CA",
      "region": "QC",
      "regionName": "Quebec",
      "city": "Montreal",
      "timezone": "America/Toronto",
    }));

    done();
  } catch (err) {
    done(err);
  }
};
