const BaseRepository = require("../core/baseRepository");
const { FlightInfo } = require("../models/documents");
const { EFlightWaypoint } = require("../constants");
const { generateRandomString } = require("../helpers/stringHelper");
const pagination = require("../helpers/paginationHelper");
const dateTime = require("../helpers/dateTimeHelper");
const filterHelper = require("../helpers/filterHelper");
const paginationHelper = require("../helpers/paginationHelper");

class FlightInfoRepository extends BaseRepository {
  constructor() {
    super(FlightInfo);
  }

  /**
   * 
   * @param {String} origin 
   * @param {String} destination 
   * @param {Date} time 
   * @param {String} [code] 
   * @returns {Promise<FlightInfo>}
   */
  async createFlightInfo(origin, destination, time, code) {
    let flightInfo;

    if (!!code) {
      flightInfo = await this.findOne({ code });
    }

    if (!flightInfo) {
      const code = await this.generateUniqueCode();
      flightInfo = new FlightInfo({ code, origin, destination, time });
      await flightInfo.save();
    }

    return flightInfo;
  }

  async cachePopularWaypoints() {

  }

  async getCachedPopularWaypoints(waypointType, count = 10) {
    let result = [];

    if (EFlightWaypoint.check(["ORIGIN", "DESTINATION"], waypointType)) {
      const agrFlightInfo = FlightInfo.aggregate();
      // agrFlightInfo.append({ $unwind: "$searches" });

      agrFlightInfo.append({ $match: { [waypointType.toLowerCase() + ".code"]: { $ne: "UNKNOWN" } } });
      agrFlightInfo.append({
        $group: {
          _id: {
            airport: {
              code: "$" + waypointType.toLowerCase() + ".code",
              name: "$" + waypointType.toLowerCase() + ".name",
            },
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
          airport: "$_id.airport",
          count: "$count",
        }
      });
      agrFlightInfo.append({
        $project: {
          airport: 1,
          count: 1,
          // name: 1,
          _id: 0,
        }
      });
      result = await agrFlightInfo.exec();
    }

    return result.map(flight => ({
      code: flight.airport.code,
      name: flight.airport.name,
      description: flight.airport.description,
      count: flight.count,
    }));
  }

  async cachePopularFlights() {

  }

  async getCachedPopularFlights(count = 10) {
    let result = [];

    const agrFlightInfo = FlightInfo.aggregate();
    // agrFlightInfo.append({ $unwind: "$searches" });
    agrFlightInfo.append({
      $group: {
        _id: {
          origin: "$origin",
          destination: "$destination",
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
      origin: {
        code: flight.origin.code,
        name: flight.origin.name,
        description: flight.origin.description,
      },
      destination: {
        code: flight.destination.code,
        name: flight.destination.name,
        description: flight.destination.description,
      },
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
      // agrFlightInfo.append({ $unwind: "$searches" });
      // agrFlightInfo.append({ $match: { "searches.code": code } });
      agrFlightInfo.append({ $match: { code } });
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
    // agrFlightInfo.append({ $unwind: "$searches" });
    // agrFlightInfo.append({ $match: { "searches.code": searchCode } });
    agrFlightInfo.append({ $match: { code: searchCode } });
    const searches = await agrFlightInfo.exec();

    if (searches.length > 0) {
      return searches[0];
    }
  }

  /**
   * 
   * @param {String} searchCode 
   * @param {String} flightCode 
   * @returns {Promise<FlightInfo>}
   */
  async getFlight(searchCode, flightCode) {
    const agrFlightInfo = FlightInfo.aggregate();
    // agrFlightInfo.append({ $unwind: "$searches" });
    // agrFlightInfo.append({ $match: { "searches.code": searchCode } });
    agrFlightInfo.append({ $unwind: "$flights" });
    agrFlightInfo.append({ $match: { code: searchCode } });
    agrFlightInfo.append({ $match: { "flights.code": flightCode } });
    // agrFlightInfo.append({
    //   $addFields: {
    //     "flight": {
    //       $arrayElemAt: ["$searches.flights", flightCode]
    //     },
    //   }
    // });
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

  async updateFlightDetails(code, flightDetailsCode, newPrice, combinations) {
    // TODO: Update Other fields
    await FlightInfo.updateOne(
      {
        code,
        "flights.code": flightDetailsCode
      },
      {
        // TODO:: Update more Fields
        $set: {
          "flights.$.price": newPrice,
          "flights.$.providerData.combinations": combinations,
        }
      }
    ).then((res) => {
      return res
    })
      .catch((err) => {
        console.log(err);
      });
  }
  /** 
  * @param {Number} page
  * @param {Number} pageSize
  * @param {{field: value}[]} filters
  * @param {String} sort
  * @returns {Promise<FlightInfo>}
  */
  async getHistoryFlights(count = 10) {
    const agrFlightInfo = FlightInfo.aggregate().allowDiskUse(true);

    agrFlightInfo.append({
      $project: {
        "origin": { "code": 1 },
        "destination": { "code": 1 },
        "time": { $dateToString: { format: "%Y-%m-%d", date: "$time" } },
        "_id": 0,
        "flights": {
          "travelClass": 1,
          "itineraries": {
            "segments.departure.at": 1,
            "segments.departure.city.code": 1,
            "segments.arrival.at": 1,
            "segments.arrival.city.code": 1
          },
          "price": { "travelerPrices.count": 1, "travelerPrices.travelerType": 1 }
        }
      }
    });
    agrFlightInfo.append({ $sort: { time: -1 } });
    agrFlightInfo.append({ $limit: count });

    const result = await agrFlightInfo.exec();
    return !!result && !!result[0] ? result : undefined;

  }
};

module.exports = new FlightInfoRepository();