const BaseRepository = require("../core/baseRepository");
const { FlightInfo, Country } = require("../models/documents");
const { EFlightWaypoint } = require("../constants");
const { generateRandomString } = require("../helpers/stringHelper");

class FlightInfoRepository extends BaseRepository {
  constructor() {
    super(FlightInfo);
  }

  /**
   * 
   * @param {String} originCode 
   * @param {String} destinationCode 
   * @param {String} airlineCode 
   * @param {Date} time 
   * @returns {Promise<FlightInfo>}
   */
  async createFlightInfo(originCode, destinationCode, time) {
    let flightInfo = await this.findOne({ originCode, destinationCode });

    if (!flightInfo) {
      flightInfo = new FlightInfo({ originCode, destinationCode, time });
      await flightInfo.save();
    }

    return flightInfo;
  }

  async cachePopularWaypoints() {

  }

  async getCachedPopularWaypoints(waypointType, count = 10) {
    let result = [];

    const agrAirports = Country.aggregate();
    agrAirports.append({ $unwind: "$cities" });
    agrAirports.append({ $unwind: "$cities.airports" });
    agrAirports.append({ $replaceRoot: { newRoot: "$cities.airports" } });
    agrAirports.append({ $project: { code: 1, name: 1, description: 1, _id: 0 } });
    const airports = await agrAirports.exec();

    if (EFlightWaypoint.check(["ORIGIN", "DESTINATION"], waypointType)) {
      const agrFlightInfo = FlightInfo.aggregate();
      agrFlightInfo.append({ $unwind: "$searches" });

      // agrFlightInfo.append({
      //   $lookup: {
      //     from: "countries",
      //     let: {
      //       code: "$" + waypointType.toLowerCase() + "Code",
      //     },
      //     pipeline: [
      //       { $unwind: "$cities" },
      //       { $unwind: "$cities.airports" },
      //       {
      //         $match: {
      //           $expr: {
      //             $eq: ["$cities.airports.code", "$$code"]
      //           }
      //         }
      //       },
      //     ],
      //     as: "waypoint",
      //   }
      // });
      // agrFlightInfo.append({ $unwind: "$waypoint" });

      agrFlightInfo.append({
        $group: {
          _id: {
            code: "$" + waypointType.toLowerCase() + "Code",
            // waypoint: "$waypoint.cities.airports.name",
          },
          count: {
            $sum: 1,
          }
        }
      });
      agrFlightInfo.append({ $sort: { count: -1 } });
      agrFlightInfo.append({ $limit: count });
      agrFlightInfo.append({
        $addFields: {
          code: "$_id.code",
          count: "$count",
          // name: "$_id.waypoint"
        }
      });
      agrFlightInfo.append({
        $project: {
          code: 1,
          count: 1,
          // name: 1,
          _id: 0,
        }
      });
      result = await agrFlightInfo.exec();
    }

    return result.map(flight => {
      const airport = airports.find(airport => airport.code === flight.code);

      return {
        code: airport.code,
        name: airport.name,
        description: airport.description,
        count: flight.count,
      };
    });
  }

  async cachePopularFlights() {

  }

  async getCachedPopularFlights(count = 10) {
    let result = [];

    const agrAirports = Country.aggregate();
    agrAirports.append({ $unwind: "$cities" });
    agrAirports.append({ $unwind: "$cities.airports" });
    agrAirports.append({ $replaceRoot: { newRoot: "$cities.airports" } });
    agrAirports.append({ $project: { code: 1, name: 1, description: 1, _id: 0 } });
    const airports = await agrAirports.exec();

    const agrFlightInfo = FlightInfo.aggregate();
    agrFlightInfo.append({ $unwind: "$searches" });
    agrFlightInfo.append({
      $group: {
        _id: {
          origin: "$originCode",
          destination: "$destinationCode",
          time: "$time",
        },
        count: {
          $sum: 1,
        }
      }
    });
    agrFlightInfo.append({ $sort: { count: -1 } });
    agrFlightInfo.append({ $limit: count });
    agrFlightInfo.append({
      $addFields: {
        origin: "$_id.origin",
        destination: "$_id.destination",
        time: "$_id.time",
        count: "$count",
      }
    });
    agrFlightInfo.append({ $project: { origin: 1, destination: 1, time: 1, count: 1, _id: 0 } });
    result = await agrFlightInfo.exec();

    return result.map(flight => ({
      origin: airports.find(airport => airport.code === flight.origin),
      destination: airports.find(airport => airport.code === flight.destination),
      time: flight.time,
    }));
  }

  /**
   * 
   * @param {Number} length 
   * @returns {Promise<String>}
   */
  async generateUniqueCode(length = 20) {
    let code;
    while (!code) {
      code = generateRandomString(length, length, true, true, true);

      const agrFlightInfo = FlightInfo.aggregate();
      agrFlightInfo.append({ $unwind: "$searches" });
      agrFlightInfo.append({ $match: { "searches.code": code } });
      const searches = await agrFlightInfo.exec();
      if (searches.length > 0) {
        code = "";
      }
    }

    return code;
  }

  /**
   * 
   * @param {String} searchCode 
   * @returns {Promise<FlightInfo>}
   */
  async getSearchByCode(searchCode) {
    const agrFlightInfo = FlightInfo.aggregate();
    agrFlightInfo.append({ $unwind: "$searches" });
    agrFlightInfo.append({ $match: { "searches.code": searchCode } });
    const searches = await agrFlightInfo.exec();

    if (searches.length > 0) {
      return searches[0];
    }
  }

  /**
   * 
   * @param {String} searchCode 
   * @param {String} flightIndex 
   * @returns {Promise<FlightInfo>}
   */
  async getFlight(searchCode, flightIndex) {
    const agrFlightInfo = FlightInfo.aggregate();
    agrFlightInfo.append({ $unwind: "$searches" });
    // agrFlightInfo.append({ $unwind: "$searches.flights" });
    agrFlightInfo.append({ $match: { "searches.code": searchCode } });
    agrFlightInfo.append({
      $addFields: {
        "flight": {
          $arrayElemAt: ["$searches.flights", flightIndex]
        },
      }
    });
    agrFlightInfo.append({
      $project: {
        searches: 0,
      }
    });
    const searches = await agrFlightInfo.exec();

    if (searches.length > 0) {
      return searches[0];
    }
  }
};

module.exports = new FlightInfoRepository();