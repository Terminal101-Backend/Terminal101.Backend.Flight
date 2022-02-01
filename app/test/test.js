const { check } = require("../helpers/testHelper");
const enumTests = require("./enum");
const modelTests = require("./models");
const routeTests = require("./routes");
const serviceTests = require("./services");
const redisTest = require("./redis");

jest.setTimeout(50000);


beforeAll(done => {
  check(done, modelTests.startDbConnection, redisTest.connect);
});

describe("Random String", () => {
  const generator = require("../helpers/stringHelper").generateRandomString;

  it("Test random string generator", done => {
    try {
      for (let i = 0; i < 100000; i++) {
        const str = generator(50, 50, true, true, true);
        expect(str).toHaveLength(50);
        expect(str).toEqual(expect.not.stringMatching(/.*undefined.*/))
      }
      done();
    } catch (e) {
      done(e);
    }
  });
});

describe("Redis", () => {
});

describe("Enum", () => {
  it("Test symbolic enumerators", done => {
    check(done, enumTests.symbolicEnums);
  });

  it("Test numeric enumerators", done => {
    check(done, enumTests.numericEnums);
  });
});

describe("Model", () => {
  let vars = {};

  describe("Country Model", () => {
    vars.country = {};

    it("Add new Country", done => {
      check(done, { test: modelTests.addCountry, params: [vars.country] });
    });

    it("Add new City", done => {
      check(done, { test: modelTests.addCity, params: [vars.country] });
    });

    it("Add new Airport", done => {
      check(done, { test: modelTests.addAirport, params: [vars.country] });
    });

    it("Add new Airline", done => {
      check(done, { test: modelTests.addAirline, params: [vars.country] });
    });
  });

  it("Remove test documents", done => {
    check(done, { test: modelTests.cleanCountry, params: [vars.country] });
  });
});

describe("Service", () => {
  let vars = {};

  describe("Amadeus", () => {
    vars.amadeus = {};

    it("Get access token", done => {
      check(done, serviceTests.getAccessToken);
    });

    it("Airline code lookup", done => {
      check(done, serviceTests.airlineCodeLookup);
    });

    it("Search airport and city", done => {
      check(done, serviceTests.searchAirportAndCity);
    });

    it("Search flight", done => {
      check(done, serviceTests.flightOffersSearch);
    });
  });

  describe("Ip", () => {
    vars.ip = {};

    it("Get IP info", done => {
      check(done, serviceTests.getIpInfo);
    });
  });
});

describe("Router", () => {
  let vars = {};

  describe("Waypoint Router", () => {
    vars.waypoint = {};

    it("Get popular origin waypoints", done => {
      check(done, routeTests.popularWaypointOrigin);
    });

    it("Get popular destination waypoints", done => {
      check(done, routeTests.popularWaypointDestination);
    });

    it("search waypoints", done => {
      check(done, routeTests.searchWaypoint);
    });
  });

  describe("Flight Router", () => {
    vars.flight = {};

    it("Get popular flights", done => {
      check(done, routeTests.popularFlight);
    });

    it("Search oneway flights", done => {
      check(done, { test: routeTests.searchOnewayFlight, params: [vars.flight] });
    });

    it("Search round trip flights", done => {
      check(done, { test: routeTests.searchRoundTripFlight, params: [vars.flight] });
    });

    it("Search multi city flights", done => {
      check(done, { test: routeTests.searchMultiCityFlight, params: [vars.flight] });
    });
  });

  // it("Remove route test documents", done => {
  //   check(done, { test: routeTests.cleanSetting, params: [vars.setting] });
  // });
});


afterAll(done => {
  check(done, modelTests.stopDbConnection, redisTest.disconnect);
});
