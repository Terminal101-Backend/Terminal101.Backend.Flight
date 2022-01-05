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
      "zip": "H1K",
      "lat": 45.6085,
      "lon": -73.5493,
      "timezone": "America/Toronto",
      "isp": "Le Groupe Videotron Ltee",
      "org": "Videotron Ltee",
      "as": "AS5769 Videotron Telecom Ltee"
    }));

    done();
  } catch (err) {
    done(err);
  }
};
