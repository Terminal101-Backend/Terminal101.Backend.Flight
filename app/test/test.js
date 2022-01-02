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

  describe("Api Model", () => {
    vars.api = {};

    // it("Add new Api", done => {
    //   check(done, { test: modelTests.addApi, params: [vars.api] });
    // });
  });

  // it("Remove test documents", done => {
  //   check(done, { test: modelTests.cleanApi, params: [vars.api] }, { test: modelTests.cleanService, params: [vars.service] }, { test: modelTests.cleanSetting, params: [vars.setting] }, { test: modelTests.cleanUser, params: [vars.user] });
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
  check(done, modelTests.stopDbConnection);
});
