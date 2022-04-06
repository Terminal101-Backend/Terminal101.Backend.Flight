const BaseRepository = require("../core/baseRepository");
const { BookedFlight, Country } = require("../models/documents");
const { EBookedFlightStatus } = require("../constants");
const { generateRandomString } = require("../helpers/stringHelper");

class BookedFlightRepository extends BaseRepository {
  constructor() {
    super(BookedFlight);
  }

  /**
   * 
   * @param {String} bookedBy 
   * @param {String} origin 
   * @param {String} destination 
   * @param {String} searchedFlightCode 
   * @param {Number} flightDetailsCode
   * @param {String} transactionId
   * @returns {Promise<BookedFlight>}
   */
  async createBookedFlight(bookedBy, origin, destination, searchedFlightCode, flightDetailsCode, transactionId) {
    const bookedFlight = await this.findOne({ transactionId });

    if (!bookedFlight) {
      bookedFlight = new BookedFlight({ bookedBy, origin, destination, searchedFlightCode, flightDetailsCode, transactionId });
      await bookedFlight.save();
    }

    return bookedFlight;
  }
};

module.exports = new BookedFlightRepository();