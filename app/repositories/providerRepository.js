const BaseRepository = require("../core/baseRepository");
const { Provider } = require("../models/documents");

/**
 * @typedef TInfo
 * @property {String} name
 * @property {Boolean} isActive
 */

class ProviderRepository extends BaseRepository {
  constructor() {
    super(Provider);
  }

  /**
   * 
   * @param {String} name 
   * @param {String} code 
   * @returns {Promise<Provider>}
   */
  async createProvider(name, title, isActive = true) {
    let provider = await Provider.findOne({ name });

    if (!provider) {
      provider = new Provider({ name, title, isActive });
    } else {
      provider.title = title;
      provider.isActive = isActive;
    }

    await provider.save();

    return provider;
  }

  async getActiveProviders() {
    const providers = await Provider.find({ isActive: true });

    return providers;
  }
};

module.exports = new ProviderRepository();
