const { Model, Query } = require("mongoose");

class BaseRepository {
  /**
   * @type {Model}
   */
  #model = {};

  /**
   * 
   * @param {Model} model 
   */
  constructor(model) {
    this.#model = model;
  }

  /**
   * @param {Object} query 
   * @returns {Promise<Query>}
   */
  async findMany(query = {}) {
    return await this.#model.find(query);
  }

  /**
   * @param {Object} query 
   * @returns {Promise<Query>}
   */
  async findOne(query) {
    return await this.#model.findOne(query);
  }

  /**
   * @param {String} id
   * @returns {Promise<Query>}
   */
  async findById(id) {
    return await this.#model.findById(id);
  }

  /**
   * @param {Object} query 
   * @param {Object} newValues
   * @returns {Promise<Query>}
   */
  async updateMany(query, newValues) {
    return await this.#model.updateMany(query, newValues);
  }

  /**
   * @param {Object} query 
   * @param {Object} newValues
   * @returns {Promise<Query>}
   */
  async updateOne(query, newValues) {
    return await this.#model.findOneAndUpdate(query, newValues);
  }

  /**
   * @param {String} id
   * @returns {Promise<Query>}
   */
  async updateById(id, newValues) {
    return await this.#model.findByIdAndUpdate(id, newValues);
  }

  /**
   * @param {Object} query 
   * @returns {Promise<Query>}
   */
  async deleteMany(query) {
    return await this.#model.deleteMany(query);
  }

  /**
   * @param {Object} query 
   * @returns {Promise<Query>}
   */
  async deleteOne(query) {
    return await this.#model.findOneAndRemove(query);
  }

  /**
   * @param {String} id
   * @returns {Promise<Query>}
   */
  async deleteById(id) {
    return await this.#model.findByIdAndRemove(id);
  }
}

module.exports = BaseRepository;