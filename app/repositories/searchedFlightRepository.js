const BaseRepository = require("../core/baseRepository");
const { SearchedFlight } = require("../models/documents");

class SearchedFlightRepository extends BaseRepository {
  constructor() {
    super(SearchedFlight);
  }

  /**
   * 
   * @param {String} flightId 
   * @param {Date} searchedTime 
   * @returns {Promise<SearchedFlight>}
   */
  async createSearchedFlight(flightId, searchedTime) {
    let searchedFlight = new SearchedFlight({ flightId, searchedTime });

    await searchedFlight.save();

    return searchedFlight;
  }
};


module.exports = new SearchedFlightRepository();