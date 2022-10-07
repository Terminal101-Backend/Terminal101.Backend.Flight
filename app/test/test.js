const {
  check
} = require("../helpers/testHelper");
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

describe("Redis", () => { });

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
      check(done, {
        test: modelTests.addCountry,
        params: [vars.country]
      });
    });

    it("Add new City", done => {
      check(done, {
        test: modelTests.addCity,
        params: [vars.country]
      });
    });

    it("Add new Airport", done => {
      check(done, {
        test: modelTests.addAirport,
        params: [vars.country]
      });
    });

    // it("Add new Airline", done => {
    //   check(done, { test: modelTests.addAirline, params: [vars.country] });
    // });
  });

  describe("Flight Condition Model", () => {
    vars.flightCondition = {};

    it("Add new flight condition", done => {
      check(done, {
        test: modelTests.addFlightCondition,
        params: [vars.flightCondition]
      });
    });

    it("Get flight condition", done => {
      check(done, {
        test: modelTests.getFlightCondition,
        params: [vars.flightCondition]
      });
    });
  });

  it("Remove test documents", done => {
    check(done, {
      test: modelTests.cleanCountry,
      params: [vars.country]
    },
      {
        test: modelTests.cleanFlightCondition,
        params: [vars.flightCondition]
      });
  });
});

describe("Service", () => {
  let vars = {};

  describe("Amadeus", () => {
    vars.amadeus = {};

    it("Get access token", done => {
      check(done, serviceTests.amadeus.getAccessToken);
    });

    it("Airline code lookup", done => {
      check(done, serviceTests.amadeus.airlineCodeLookup);
    });

    it("Search airport and city", done => {
      check(done, serviceTests.amadeus.searchAirportAndCity);
    });

    it("Search flight", done => {
      check(done, serviceTests.amadeus.flightOffersSearch);
    });

    it("Covid 19", done => {
      check(done, serviceTests.amadeus.covid19AreaReport);
    });
  });

  describe("Parto", () => {
    vars.parto = {};

    it("Create session", done => {
      check(done, serviceTests.parto.createSession);
    });

    it("Search flight", done => {
      check(done, {
        params: [vars.parto],
        test: serviceTests.parto.airLowFareSearch
      });
    });

    it("Book flight", done => {
      check(done, {
        params: [vars.parto],
        test: serviceTests.parto.airBook
      });
    });

    it("Book data", done => {
      check(done, {
        params: [vars.parto],
        test: serviceTests.parto.airBookData
      });
    });

    it("Book cancel", done => {
      check(done, {
        params: [vars.parto],
        test: serviceTests.parto.airBookCancel
      });
    });
  });

  describe("Avtra", () => {
    vars.avtra = {};

    it("Ping", done => {
      check(done, serviceTests.avtra.ping);
    });

    it("Low fare search", done => {
      check(done, serviceTests.avtra.lowFareSearch);
    });
  });

  describe("Ip", () => {
    vars.ip = {};

    it("Get IP info", done => {
      check(done, serviceTests.ip.getIpInfo);
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
      check(done, {
        test: routeTests.searchOnewayFlight,
        params: [vars.flight]
      });
    });

    it("Search round trip flights", done => {
      check(done, {
        test: routeTests.searchRoundTripFlight,
        params: [vars.flight]
      });
    });

    it("Search multi city flights", done => {
      check(done, {
        test: routeTests.searchMultiCityFlight,
        params: [vars.flight]
      });
    });
  });

  // it("Remove route test documents", done => {
  //   check(done, { test: routeTests.cleanSetting, params: [vars.setting] });
  // });
});


afterAll(done => {
  check(done, modelTests.stopDbConnection, redisTest.disconnect);
});