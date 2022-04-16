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
  async getFlight(searchCode, flightCode) {
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
  async regenerateAmadeusFlightObject(searchCode, flightCode, type = "flight-offers-pricing") {
    const flightInfo = await this.getFlight(searchCode, flightCode);

    return {
      data: {
        type,
        flightOffers: {
          type: "flight-offer",
          id: "1",
          source: "GDS",
          itineraries: flightInfo.flight.itineraries.map((itinerary, itineraryIndex) => ({
            segments: itinerary.segments.map((segment, segmentIndex) => ({
              departure: {
                code: segment.departure.airport.code,
                at: segment.departure.at
              },
              arrival: {
                code: segment.arrival.airport.code,
                at: segment.arrival.at
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
            travelerType: "", // TODO: Set traveler type
            price: {
              currency: flightInfo.flight.currencyCode,
            },
            fareDetailsBySegment: flightInfo.flight.itineraries.reduce((res, cur, itineraryIndex) => [...res, ...cur.segments.map((segment, segmentIndex) => ({
              segmentId: `${itineraryIndex + 1}-${segmentIndex + 1}`,
              class: "T",
            }))], [])
          })),
          travelers: [], // TODO: Generate travelers info for create order service
        },
      },
    }
  }
};

module.exports = new FlightInfoRepository();