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

module.exports.flightOffersSearch = async done => {
  try {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 5);
    const response = await amadeus.flightOffersSingleSearch("SYD", "BKK", departureDate.toISOString().split("T")[0]);

    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({
      type: "flight-offer",
      lastTicketingDate: expect.any(String),
      itineraries: expect.arrayContaining([expect.objectContaining({
        duration: expect.any(String),
        segments: expect.arrayContaining([expect.objectContaining({
          duration: expect.any(String),
          numberOfStops: expect.any(Number),
          departure: expect.objectContaining({
            iataCode: expect.any(String),
            at: expect.any(String),
          }),
          arrival: expect.objectContaining({
            iataCode: expect.any(String),
            at: expect.any(String),
          }),
          aircraft: expect.objectContaining({
            code: expect.any(String),
          }),
          carrierCode: expect.any(String),
          number: expect.any(String),
        })]),
      })]),
    })]));

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.covid19AreaReport = async done => {
  try {
    const response = await amadeus.covid19AreaReport("US");

    expect(response.data).toEqual(
      expect.objectContaining({
        type: "covid19-area-report",
        area: expect.objectContaining({
          name: "United States of America",
          areaType: "Country",
          iataCode: "US",
        })
      })
    );

    done();
  } catch (err) {
    done(err);
  }
};

