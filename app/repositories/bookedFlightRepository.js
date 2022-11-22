const BaseRepository = require("../core/baseRepository");
const { BookedFlight } = require("../models/documents");
const { EBookedFlightStatus } = require("../constants");
const { generateRandomString } = require("../helpers/stringHelper");
const paginationHelper = require("../helpers/paginationHelper");
const filterHelper = require("../helpers/filterHelper");

/**
 * @typedef {Object} PassengerInfo
 * @property {String} documentCode
 * @property {String} documentIssuedAt
 */

class BookedFlightRepository extends BaseRepository {
  constructor() {
    super(BookedFlight);
  }

  /**
   *
   * @param {String} bookedBy
   * @param {String} searchedFlightCode
   * @param {Number} flightDetailsCode
   * @param {String} transactionId
   * @returns {Promise<BookedFlight>}
   */
  async createBookedFlight(bookedBy, businessCode, providerName, searchedFlightCode, flightDetailsCode, providerPnr, transactionId, contact, passengers, flightSegments, travelClass, status) {
    let bookedFlight = !!transactionId ? await this.findOne({ transactionId }) : undefined;

    if (!bookedFlight) {
      bookedFlight = new BookedFlight({
        bookedBy,
        providerName,
        searchedFlightCode,
        flightDetailsCode,
        providerPnr,
        transactionId,
        contact,
        passengers,
        statuses: { status, changedBy: bookedBy },
        flightSegments,
        travelClass,
        businessCode
      });
      await bookedFlight.save();
    }

    return bookedFlight;
  }

  /**
   *
   * @param {String} code
   * @param {EBookedFlightStatus} status
   * @param {String} changedBy
   * @param {String} description
   * @returns {Promise<Status[]>}
   */
  async changeStatus(code, status, changedBy, description) {
    const bookedFlight = await this.findOne({ code });

    if (!bookedFlight) {
      throw "flight_not_found";
    }

    bookedFlight.statuses.push({ status, changedBy, description });
    await bookedFlight.save();

    return bookedFlight.status;
  }

  /**
   *
   * @param {String} code
   * @param {EBookedFlightStatus} status
   * @returns {Promise<Status[]>}
   */
  async getStatuses(code, status) {
    const agrBookedFlight = BookedFlight.aggregate();
    agrBookedFlight.append({
      $match: {
        code,
      }
    });
    agrBookedFlight.append({
      $unwind: "$statuses",
    });
    agrBookedFlight.append({
      $replaceRoot: {
        newRoot: "$statuses"
      },
    });
    agrBookedFlight.append({
      $match: {
        status,
      }
    });

    const bookedFlightStatuses = await agrBookedFlight.exec();

    if (!bookedFlightStatuses) {
      throw "flight_not_found";
    }

    return bookedFlightStatuses;
  }

  /**
   *
   * @param {String} code
   * @param {EBookedFlightStatus} status
   * @returns {Promise<Boolean>}
   */
  async hasStatus(code, status) {
    const bookedFlight = await this.findOne({ code, "statuses.status": status });

    return !!bookedFlight;
  }

  /**
   *
   * @param {String} bookedBy
   * @param {Number} page
   * @param {Number} pageSize
   * @param {{field: value}[]} filters
   * @param {String} sort
   * @returns {Promise<BookedFlight>}
   */
  async getBookedFlights(bookedBy, businessCode, page, pageSize, filters, sort) {
    const agrBookedFlight = BookedFlight.aggregate().allowDiskUse(true);
    if (!!bookedBy && businessCode !== 'ADMIN') {
      agrBookedFlight.append({
        $match: {
          bookedBy,
          businessCode
        }
      });
    }
    else if (!!bookedBy) {
      agrBookedFlight.append({
        $match: {
          bookedBy
        }
      });
    }
    agrBookedFlight.append({
      $lookup: {
        from: 'flightinfos',
        localField: 'searchedFlightCode',
        foreignField: 'code',
        as: 'flightInfo'
      }
    });
    agrBookedFlight.append({ $unwind: "$flightInfo" });
    agrBookedFlight.append({ $unwind: "$flightInfo.flights" });
    agrBookedFlight.append({
      $match: {
        $expr: {
          $eq: ["$flightDetailsCode", "$flightInfo.flights.code"],
        }
      }
    });
    agrBookedFlight.append({
      $addFields: {
        lastStatus: { $last: "$statuses" }
      }
    });
    agrBookedFlight.append({
      $addFields: {
        status: "$lastStatus.status"
      }
    });
    agrBookedFlight.append({
      $project: {
        "bookedBy": 1,
        "providerName": 1,
        "providerPnr": 1,
        "code": 1,
        "searchedFlightCode": 1,
        "flightDetailsCode": 1,
        "statuses": 1,
        "status": 1,
        "time": 1,
        "passengers": 1,
        "contact": 1,
        "flightInfo.origin": 1,
        "flightInfo.destination": 1,
        "flightInfo.travelClass": 1,
        "flightInfo.flights.price.total": 1,
        "flightInfo.flights.currencyCode": 1,
        "flightInfo.userType": 1,
        "flightInfo.testMode": 1,
      }
    });

    filterHelper.filterAndSort(agrBookedFlight, filters, sort);
    return await paginationHelper.rootPagination(agrBookedFlight, page, pageSize);

    // return await agrBookedFlight.exec();
  }

  /**
   *
   * @param {String} bookedBy
   * @param {String} businessCode
   * @param {Number} page
   * @param {Number} pageSize
   * @param {{field: value}[]} filters
   * @param {String} sort
   * @returns {Promise<BookedFlight>}
   */
  async getBookedFlightsHistory(bookedBy, businessCode, page, pageSize, filters, sort) {
    const agrBookedFlight = BookedFlight.aggregate().allowDiskUse(true);

    agrBookedFlight.append({
      $match: {
        bookedBy,
        businessCode,
      }
    });
    agrBookedFlight.append({
      $lookup: {
        from: 'flightinfos',
        localField: 'searchedFlightCode',
        foreignField: 'code',
        as: 'flightInfo'
      }
    });
    agrBookedFlight.append({ $unwind: "$flightInfo" });
    agrBookedFlight.append({ $unwind: "$flightInfo.flights" });
    agrBookedFlight.append({
      $match: {
        $expr: {
          $eq: ["$flightDetailsCode", "$flightInfo.flights.code"],
        }
      }
    });
    agrBookedFlight.append({
      $addFields: {
        lastStatus: { $last: "$statuses" }
      }
    });
    agrBookedFlight.append({
      $addFields: {
        status: "$lastStatus.status"
      }
    });
    agrBookedFlight.append({
      $project: {
        "bookedBy": 1,
        "providerName": 1,
        "providerPnr": 1,
        "code": 1,
        "searchedFlightCode": 1,
        "flightDetailsCode": 1,
        "statuses": 1,
        "status": 1,
        "time": 1,
        "passengers": 1,
        "contact": 1,
        "flightInfo.origin": 1,
        "flightInfo.destination": 1,
        "flightInfo.travelClass": 1,
        "flightInfo.flights.price.total": 1,
        "flightInfo.flights.currencyCode": 1,
        "flightInfo.userType": 1,
        "flightInfo.testMode": 1,
      }
    });

    filterHelper.filterAndSort(agrBookedFlight, filters, sort);
    return await paginationHelper.rootPagination(agrBookedFlight, page, pageSize);
  }

  /**
   *
   * @param {String} code
   * @returns {Promise<BookedFlight>}
   */
  async getBookedFlight(userCode, code) {
    const agrBookedFlight = BookedFlight.aggregate();
    agrBookedFlight.append({
      $match: {
        bookedBy: userCode,
        code,
      }
    });
    agrBookedFlight.append({
      $lookup: {
        from: 'flightinfos',
        localField: 'searchedFlightCode',
        foreignField: 'code',
        as: 'flightInfo'
      }
    });
    agrBookedFlight.append({ $unwind: "$flightInfo" });
    // agrBookedFlight.append({ $unwind: "$flightInfo.searches" });
    agrBookedFlight.append({ $unwind: "$flightInfo.flights" });
    agrBookedFlight.append({
      $match: {
        $expr: {
          $eq: ["$searchedFlightCode", "$flightInfo.code"]
        }
      }
    });
    agrBookedFlight.append({
      $match: {
        $expr: {
          $eq: ["$flightDetailsCode", "$flightInfo.flights.code"]
        }
      }
    });
    agrBookedFlight.append({
      $addFields: {
        lastStatus: { $last: "$statuses" }
      }
    });
    agrBookedFlight.append({
      $addFields: {
        status: "$lastStatus.status"
      }
    });

    const result = await agrBookedFlight.exec();
    return !!result && !!result[0] ? result[0] : undefined;
  }

  /**
   *
   * @param {*} itineraries
   * @returns
   */
  generateBookedFlightSegments(itineraries) {
    return;
  }

  /**
   *
   * @param {PassengerInfo[]} passengers
   * @param {FlightSegmentInfo[]} flightSegments
   * @returns {Promise}
   */
  async getDuplicatedBookedFlight(passengers, itineraries) {
    let bookedFlight;
    let duplicate = false;

    for (const segment of itineraries.segments) {
      let agr = BookedFlight.aggregate();
      agr.append({
        $unwind: "$flightSegments"
      });
      agr.append({
        $match: {
          "flightSegments.departure.city.code": segment.departure.city.code,
          "flightSegments.departure.at": segment.departure.at,
          "flightSegments.arrival.city.code": segment.arrival.city.code,
          "flightSegments.arrival.at": segment.arrival.at
        }
      });
      agr.append({
        $unwind: "$passengers"
      });
      for (const passenger of passengers) {
        agr.append({
          $match: {
            "passengers.documentCode": passenger.documentCode,
            "passengers.documentIssuedAt": passenger.documentIssuedAt
          }
        })
      }
      bookedFlight = await agr.exec();
      if (!!bookedFlight && bookedFlight.length !== 0) {
        duplicate = true;
        break;
      }
    }

    return duplicate;
  }

  async getBookedFlightsChartHistory(businessCode, filters, sort) {
    const agrBookedFlight = BookedFlight.aggregate();
    agrBookedFlight.append({
      $match: {
        businessCode,
      }
    })
    filterHelper.filterAndSort(agrBookedFlight, filters, sort);

    agrBookedFlight.append(
      {
        $group:
        {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          statuses: { $push: { $last: ["$statuses.status"] } },
          count: { $count: {} },
          passengersCount: { $sum: { $size: "$passengers" } }
        }
      },
      { $sort: { _id: 1 } },
    );

    agrBookedFlight.append({
      $project: {
        "_id": 1,
        "count": 1,
        "statuses": 1,
        "passengersCount": 1,
      }
    });
    // return await paginationHelper.rootPagination(agrBookedFlight, page, pageSize);
    const result = await agrBookedFlight.exec();
    return !!result && !!result[0] ? result : undefined;
  }
};

module.exports = new BookedFlightRepository();