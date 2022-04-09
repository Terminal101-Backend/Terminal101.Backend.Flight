const BaseRepository = require("../core/baseRepository");
const { BookedFlight } = require("../models/documents");
const { EBookedFlightStatus } = require("../constants");

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
  async createBookedFlight(bookedBy, searchedFlightCode, flightDetailsCode, transactionId) {
    let bookedFlight = await this.findOne({ transactionId });

    if (!bookedFlight) {
      bookedFlight = new BookedFlight({ bookedBy, searchedFlightCode, flightDetailsCode, transactionId });
      await bookedFlight.save();
    }

    return bookedFlight;
  }


  /**
   * 
   * @param {String} bookedBy 
   * @returns {Promise<BookedFlight>}
   */
  async getBookedFlights(bookedBy) {
    const agrBookedFlight = BookedFlight.aggregate();
    agrBookedFlight.append({
      $match: {
        bookedBy,
      }
    });
    agrBookedFlight.append({ $match: { bookedBy } });
    agrBookedFlight.append({
      $lookup: {
        from: 'flightinfos',
        localField: 'searchedFlightCode',
        foreignField: 'searches.code',
        as: 'flightInfo'
      }
    });
    agrBookedFlight.append({ $unwind: "$flightInfo" });
    agrBookedFlight.append({ $unwind: "$flightInfo.searches" });
    agrBookedFlight.append({ $unwind: "$flightInfo.searches.flights" });
    agrBookedFlight.append({
      $match: {
        $expr: {
          $eq: ["$searchedFlightCode", "$flightInfo.searches.code"]
        }
      }
    });
    agrBookedFlight.append({
      $match: {
        $expr: {
          $eq: ["$flightDetailsCode", "$flightInfo.searches.flights.code"]
        }
      }
    });

    return await agrBookedFlight.exec();
  }
};

module.exports = new BookedFlightRepository();