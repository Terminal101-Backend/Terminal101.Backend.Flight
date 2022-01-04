const { expect } = require("@jest/globals");
const { amadeus } = require("../../services");

module.exports.getAccessToken = async done => {
  try {
    const response = await amadeus.getAccessToken();

    expect(response.token_type).toBe("Bearer");
    expect(response.state).toBe("approved");
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.airlineCodeLookup = async done => {
  try {
    const response = await amadeus.airlineCodeLookup("BA");

    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({
      type: 'airline',
      iataCode: 'BA',
      icaoCode: 'BAW',
      businessName: 'BRITISH AIRWAYS',
      commonName: 'BRITISH A/W'
    })]));

    done();
  } catch (err) {
    done(err);
  }
};


module.exports.searchAirportAndCity = async done => {
  try {
    const response = await amadeus.searchAirportAndCity("MUC");

    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({
      type: expect.any(String),
      subType: expect.any(String),
      name: expect.any(String),
      detailedName: expect.any(String),
      id: expect.any(String),
      timeZoneOffset: expect.any(String),
      iataCode: "MUC",
    })]));

    done();
  } catch (err) {
    done(err);
  }
};

