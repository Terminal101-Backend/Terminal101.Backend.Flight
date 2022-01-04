const { check } = require("../helpers/testHelper");
const enumTests = require("./enum");
const modelTests = require("./models");
const routeTests = require("./routes");

// jest.setTimeout(10000);

beforeAll(done => {
  check(done, modelTests.startDbConnection);
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
  check(done, modelTests.stopDbConnection);
});
