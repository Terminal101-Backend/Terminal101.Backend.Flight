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

module.exports.popularWaypointOrigin = done => {
  agent
    .get("/waypoint/ORIGIN/popular")
    .expect(res => {
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: expect.any(String),
            name: expect.any(String),
            // description: expect.any(String),
            count: expect.any(Number),
          })
        ])
      );
    })
    .expect(200, done);
};

module.exports.popularWaypointDestination = done => {
  agent
    .get("/waypoint/DESTINATION/popular")
    .expect(res => {
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: expect.any(String),
            name: expect.any(String),
            // description: expect.any(String),
            count: expect.any(Number),
          })
        ])
      );
    })
    .expect(200, done);
};

module.exports.searchWaypoint = (done, vars) => {
  agent
    .get("/waypoint/ORIGIN")
    .query({
      keyword: "FRA"
    })
    .expect(res => {
      expect(res.body.data).toEqual(expect.objectContaining({
        countries: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            code: expect.any(String),
            cities: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                code: expect.any(String),
                airports: expect.arrayContaining([
                  expect.objectContaining({
                    name: expect.any(String),
                    code: expect.any(String),
                  })
                ])
              })
            ])
          })
        ]),
        cities: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            code: expect.any(String),
            airports: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                code: expect.any(String),
              })
            ])
          })
        ]),
        airports: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            code: expect.any(String),
          })
        ])
      }));
    })
    .expect(200, done);
};
