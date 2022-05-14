const BaseRepository = require("../core/baseRepository");
const { FlightInfo } = require("../models/documents");
const { EFlightWaypoint } = require("../constants");
const { generateRandomString } = require("../helpers/stringHelper");
const pagination = require("../helpers/paginationHelper");

class FlightInfoRepository extends BaseRepository {
  constructor() {
    super(FlightInfo);
  }

  /**
   * 
   * @param {String} origin 
   * @param {String} destination 
   * @param {Date} time 
   * @returns {Promise<FlightInfo>}
   */
  async createFlightInfo(origin, destination, time) {
    let flightInfo = await this.findOne({ origin, destination, time });

    if (!flightInfo) {
      flightInfo = new FlightInfo({ origin, destination, time });
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
      agrFlightInfo.append({ $unwind: "$searches" });

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
    agrFlightInfo.append({ $unwind: "$searches" });
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
   * @param {String} flightCode 
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
          $arrayElemAt: ["$searches.flights", flightCode]
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

  /**
   * 
   * @param {String} searchCode 
   * @param {Number} flightCode 
   * @param {String<"flight-offers-pricing|flight-order">} type 
   * @returns {Promise}
   */
  async regenerateAmadeusFlightOfferObject(searchCode, flightCode) {
    /**
     * 
     * @param {Date} date 
     * @returns {String}
     */
    const dateToIsoString = date => {
      let result = date.toISOString();
      return result.replace(/\.\d+Z$/, "");
    }

    const flightInfo = await this.getFlight(searchCode, flightCode);
    let travelClass;
    switch (flightInfo.flight.travelClass) {
      case "ECONOMY":
        travelClass = "Y";
        break;

      case "PERMIUM_ECONOMY":
        travelClass = "W";
        break;

      case "BUSINESS":
        travelClass = "J";
        break;

      case "FIRST":
        travelClass = "F";
        break;

      default:
        travelClass = "T";
    }

    return {
      type: "flight-offer",
      id: "1",
      source: "GDS",
      itineraries: flightInfo.flight.itineraries.map((itinerary, itineraryIndex) => ({
        segments: itinerary.segments.map((segment, segmentIndex) => ({
          departure: {
            iataCode: segment.departure.airport.code,
            at: dateToIsoString(segment.departure.at),
          },
          arrival: {
            iataCode: segment.arrival.airport.code,
            at: dateToIsoString(segment.arrival.at),
          },
          carrierCode: segment.airline.code,
          number: segment.flightNumber,
          id: `${itineraryIndex + 1}-${segmentIndex + 1}`,
        })),
      })),
      validatingAirlineCodes: flightInfo.flight.itineraries.reduce((res, cur) => [...res, ...cur.segments.map(segment => segment.airline.code)], []),
      travelerPricings: flightInfo.flight.price.travelerPrices.map((price, travelerIndex) => ({
        travelerId: `${travelerIndex + 1}`,
        fareOption: "STANDARD",
        travelerType: price.travelerType,
        price: {
          currency: flightInfo.flight.currencyCode,
        },
        fareDetailsBySegment: flightInfo.flight.itineraries.reduce((res, cur, itineraryIndex) => [...res, ...cur.segments.map((segment, segmentIndex) => ({
          segmentId: `${itineraryIndex + 1}-${segmentIndex + 1}`,
          class: travelClass,
        }))], [])
      })),
    }
  }
};

module.exports = new FlightInfoRepository();