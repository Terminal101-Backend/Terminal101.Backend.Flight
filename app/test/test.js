const { check } = require("../helpers/testHelper");
const enumTests = require("./enum");
const modelTests = require("./models");
const routeTests = require("./routes");
const serviceTests = require("./services");
const redisTest = require("./redis");

// jest.setTimeout(10000);


describe("Redis", () => {
});


beforeAll(done => {
  check(done, modelTests.startDbConnection, redisTest.connect);
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
  });

  describe("Ip", () => {
    vars.ip = {};

    it("Get IP info", done => {
      check(done, serviceTests.getIpInfo);
    });
  });

  // it("Remove route test documents", done => {
  //   check(done, { test: routeTests.cleanSetting, params: [vars.setting] });
  // });
});

describe("Router", () => {
  let vars = {};

  describe("Setting Router", () => {
    vars.setting = {};

    // it("Add new setting", done => {
    //   check(done, routeTests.addSetting);
    // });
  });

  // it("Remove route test documents", done => {
  //   check(done, { test: routeTests.cleanSetting, params: [vars.setting] });
  // });
});


afterAll(done => {
  check(done, modelTests.stopDbConnection, redisTest.disconnect);
});
