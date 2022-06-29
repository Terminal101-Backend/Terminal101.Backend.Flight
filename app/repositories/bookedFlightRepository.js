const BaseRepository = require("../core/baseRepository");
const { BookedFlight } = require("../models/documents");
const { EBookedFlightStatus } = require("../constants");
const { generateRandomString } = require("../helpers/stringHelper");
const { paginationHelper } = require("../helpers");

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
  async createBookedFlight(bookedBy, searchedFlightCode, flightDetailsCode, transactionId, contact, passengers, status) {
    let bookedFlight = !!transactionId ? await this.findOne({ transactionId }) : undefined;

    if (!bookedFlight) {
      let code;
      while (!code) {
        code = generateRandomString(15, 20, true, true, false);

        bookedFlight = await this.findOne({ code });

        if (!!bookedFlight) {
          code = undefined;
        }
      }

      bookedFlight = new BookedFlight({ code, bookedBy, searchedFlightCode, flightDetailsCode, transactionId, contact, passengers, status });
      await bookedFlight.save();
    }

    return bookedFlight;
  }

  /**
   * 
   * @param {String} bookedBy 
   * @returns {Promise<BookedFlight>}
   */
  async getBookedFlights(bookedBy, page, pageSize) {
    const agrBookedFlight = BookedFlight.aggregate();
    agrBookedFlight.append({
      $match: {
        bookedBy,
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

    return await paginationHelper.rootPagination(agrBookedFlight, page, pageSize);

    // return await agrBookedFlight.exec();
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

    const result = await agrBookedFlight.exec();
    return !!result && !!result[0] ? result[0] : {};
  }
};

module.exports = new BookedFlightRepository();