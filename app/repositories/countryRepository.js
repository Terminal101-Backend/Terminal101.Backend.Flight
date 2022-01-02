const BaseRepository = require("../core/baseRepository");
const { Country } = require("../models/documents");

class CountryRepository extends BaseRepository {
  constructor() {
    super(Country);
  }

  /**
   * 
   * @param {String} name 
   * @param {String} code 
   * @returns {Promise<Country>}
   */
  async createCountry(name, code) {
    let country = new Country({ name, code });

    await country.save();

    return country;
  }
};


module.exports = new CountryRepository();