const {
  expect
} = require("@jest/globals");
const {
  agent: request
} = require("supertest");
const app = require("../..");

const agent = request(app)
  .set("Accept", "application/json")
  .set("Content-Type", "application/json; charset=utf-8");

module.exports.popularFlight = done => {
  agent
    .get("/flight/popular")
    .expect(res => {
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            origin: expect.objectContaining({
              code: expect.any(String),
              name: expect.any(String),
              // description: expect.any(String),
            }),
            destination: expect.objectContaining({
              code: expect.any(String),
              name: expect.any(String),
              // description: expect.any(String),
            }),
            time: expect.any(String),
          })
        ])
      );
    })
    .expect(200, done);
};

module.exports.searchOnewayFlight = (done, vars) => {
  const departure = new Date();
  departure.setDate(departure.getDate() + 5);
  const departureDate = departure.toISOString().split("T")[0];

  agent
    .get("/flight/search")
    .query({
      origin: "SYD",
      destination: "DUB",
      departureDate,
    })
    .expect(res => {
      expect(res.body.data).toEqual(
        expect.objectContaining({
          code: expect.any(String),
          origin: expect.objectContaining({
            code: "SYD"
          }),
          destination: expect.objectContaining({
            code: "DUB"
          }),
          time: departureDate + "T00:00:00.000Z",
        })
      );
    })
    .expect(200, done);
};

module.exports.searchRoundTripFlight = (done, vars) => {
  const departure = new Date();
  departure.setDate(departure.getDate() + 5);
  const departureDate = departure.toISOString().split("T")[0];
  const ret = new Date();
  ret.setDate(ret.getDate() + 10);
  const returnDate = ret.toISOString().split("T")[0];

  agent
    .get("/flight/search")
    .query({
      origin: "SYD",
      destination: "DUB",
      departureDate,
      returnDate,
    })
    .expect(res => {
      expect(res.body.data).toEqual(
        expect.objectContaining({
          code: expect.any(String),
          origin: expect.objectContaining({
            code: "SYD"
          }),
          destination: expect.objectContaining({
            code: "DUB"
          }),
          time: departureDate + "T00:00:00.000Z",
        })
      );
    })
    .expect(200, done);
};

module.exports.searchMultiCityFlight = (done, vars) => {
  const departure = new Date();
  departure.setDate(departure.getDate() + 5);
  const departureDate = departure.toISOString().split("T")[0];
  const ret = new Date();
  ret.setDate(ret.getDate() + 10);
  const returnDate = ret.toISOString().split("T")[0];
  const seg1 = new Date();
  seg1.setDate(seg1.getDate() + 7);
  const seg1date = seg1.toISOString().split("T")[0];
  const seg2 = new Date();
  seg2.setDate(seg2.getDate() + 9);
  const seg2date = seg2.toISOString().split("T")[0];

  agent
    .get("/flight/search")
    .query({
      origin: "SYD",
      destination: "DUB",
      segments: `BKK:MUC:${seg1date},MUC:BKK:${seg2date}`,
      departureDate,
      returnDate,
    })
    .expect(res => {
      expect(res.body.data).toEqual(
        expect.objectContaining({
          code: expect.any(String),
          origin: expect.objectContaining({
            code: "SYD"
          }),
          destination: expect.objectContaining({
            code: "DUB"
          }),
          time: departureDate + "T00:00:00.000Z",
        })
      );
    })
    .expect(200, done);
};

module.exports.filterSearchedFlight = (done, vars) => {
  agent
    .get(`/flight/search/${searchCode}/filter`)
    .expect(res => {
      expect(res.body.data).toEqual(expect.objectContaining({
        name: "srv1",
        description: "Service 1 Description",
      }));
    })
    .expect(200, done);
};

module.exports.getSearchedFlightByCode = (done, vars) => {
  agent
    .get(`/flight/search/${searchCode}/filter`)
    .expect(res => {
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
      })]));
    })
    .expect(200, done);
};

module.exports.getSpecificFlight = (done, vars) => {
  agent
    .get(`/flight/search/${searchCode}/flight/0`)
    .expect(res => {
      expect(res.body.data).toEqual(expect.objectContaining({
        name: "srv1",
        description: "Service 1 Description",
      }));
    })
    .expect(200, done);
};