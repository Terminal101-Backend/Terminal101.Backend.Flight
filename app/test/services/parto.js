const {
  expect
} = require("@jest/globals");
const {
  parto
} = require("../../services");

module.exports.createSession = async done => {
  try {
    const response = await parto.createSession();

    expect(response.Success).toBeTruthy();
    expect(response.SessionId).toEqual(expect.any(String));
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.airLowFareSearch = async (done, vars) => {
  try {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 5);
    const response = await parto.airLowFareSearch("TBS", "IST", departureDate);

    expect(response).toEqual(expect.arrayContaining([expect.objectContaining({
      FareSourceCode: expect.stringMatching(/\d+/),
      OriginDestinationOptions: expect.arrayContaining([expect.objectContaining({
        FlightSegments: expect.arrayContaining([expect.objectContaining({})]),
      })]),
    })]));

    vars.searchCode = response[0].FareSourceCode;

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.airBook = async (done, vars) => {
  try {
    const leader = {
      mobileNumber: "00442081234287",
      email: "Sales@Partocrs.com",
    };
    const travelers = [{
      dateOfBirth: "1990-11-01T00:00:00",
      gender: "MALE",
      firstName: "Joe",
      middleName: "",
      lastName: "Smith",
      document: {
        issuedAt: "US",
        expirationDate: "2025-11-01T00:00:00",
        code: "AB1234567",
      },
      // nationalId: "4900104132",
      // nationality: "US",
      // extraServiceIds: [],
      // mealTypeServiceIds: [],
      // seatPreference: 0,
      // mealPreference: 0,
      // wheelchair: false,
    }];
    const response = await parto.airBook(vars.searchCode, leader, travelers);


    expect(response).toEqual(expect.objectContaining({
      Success: true,
      TktTimeLimit: expect.any(String),
      UniqueId: expect.any(String),
    }));

    vars.bookId = response.UniqueId;

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.airBookData = async (done, vars) => {
  try {
    const response = await parto.airBookData(vars.bookId);

    expect(response).toEqual(expect.objectContaining({
      UniqueId: vars.bookId,
      Success: true,
    }));

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.airBookCancel = async (done, vars) => {
  try {
    const response = await parto.airBookCancel(vars.bookId);

    expect(response).toEqual(
      expect.objectContaining({
        Success: true,
      })
    );

    done();
  } catch (err) {
    done(err);
  }
};