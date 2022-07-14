const BaseRepository = require("../core/baseRepository");
const { FlightCondition } = require("../models/documents");
const pagination = require("../helpers/paginationHelper");

/**
 * @typedef TCondition
 * @property {String[]} items
 * @property {Boolean} exclude
 */

class FlightConditionRepository extends BaseRepository {
  /**
   * @param {Boolean} origin 
   */
  #getCountryPipeline(origin) {
    return {
      $lookup: {
        from: "countries",
        as: `condition.${!!origin ? "origin" : "destination"}.countries`,
        let: {
          conditionItems: `$${!!origin ? "origin" : "destination"}.items`,
        },
        pipeline: [
          {
            $project: {
              _id: 0,
              code: 1,
              name: 1,
              type: "COUNTRY",
            },
          },
          {
            $match: {
              $expr: {
                $in: ["$code", "$$conditionItems"]
              },
            },
          },
        ]
      }
    };
  }

  /**
   * @param {Boolean} origin 
   */
  #getCityPipeline(origin) {
    return {
      $lookup: {
        from: "countries",
        as: `condition.${!!origin ? "origin" : "destination"}.cities`,
        let: {
          conditionItems: `$${!!origin ? "origin" : "destination"}.items`,
        },
        pipeline: [
          {
            $project: {
              cities: {
                code: 1,
                name: 1,
                type: "CITY",
              },
            },
          },
          {
            $project: {
              items: {
                $filter: {
                  input: "$cities",
                  as: "item",
                  cond: {
                    $in: [
                      {
                        $concat: ["C_", "$$item.code"]
                      },
                      `$$conditionItems`
                    ]
                  }
                },
              },
            },
          },
        ]
      }
    };
  }

  /**
   * @param {Boolean} origin 
   */
  #getAirportPipeline(origin) {
    return {
      $lookup: {
        from: "countries",
        as: `condition.${!!origin ? "origin" : "destination"}.airports`,
        let: {
          conditionItems: `$${!!origin ? "origin" : "destination"}.items`,
        },
        pipeline: [
          {
            $unwind: "$cities"
          },
          {
            $project: {
              cities: {
                airports: {
                  code: 1,
                  name: 1,
                  description: 1,
                  type: "AIRPORT",
                }
              },
            },
          },
          {
            $project: {
              items: {
                $filter: {
                  input: "$cities.airports",
                  as: "item",
                  cond: {
                    $in: ["$$item.code", "$$conditionItems"]
                  }
                },
              },
            },
          },
        ]
      }
    };
  }

  #getAirlinePipeline() {
    return {
      $lookup: {
        from: "airlines",
        as: "airlineInfo",
        localField: "airline.items",
        foreignField: "code",
      }
    };
  }

  #getFinalProjection() {
    return [
      {
        $addFields: {
          "condition.destinationCities": {
            $reduce: {
              input: "$condition.destination.cities",
              // input: {
              //   $concatArrays: [
              //     "$condition.destination.cities",
              //     "$condition.destination.airports",
              //     // "$condition.destination.countries",
              //   ]
              // },
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  "$$this.items",
                ]
              }
            }
          },
        },
      }, {
        $addFields: {
          "condition.destinationAirports": {
            $reduce: {
              input: "$condition.destination.airports",
              // input: {
              //   $concatArrays: [
              //     "$condition.destination.cities",
              //     "$condition.destination.airports",
              //     // "$condition.destination.countries",
              //   ]
              // },
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  "$$this.items",
                ]
              }
            }
          },
        },
      }, {
        $project: {
          code: 1,
          providerNames: 1,
          isRestricted: 1,
          "airline.exclude": 1,
          "airline.items": {
            $map: {
              input: "$airlineInfo",
              as: "item",
              in: {
                code: "$$item.code",
                name: "$$item.name",
                description: "$$item.description",
              }
            }
          },
          "origin.exclude": 1,
          "origin.items": {
            $reduce: {
              input: {
                $concatArrays: [
                  "$condition.origin.cities",
                  "$condition.origin.airports",
                  // "$condition.origin.countries",
                ]
              },
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  "$$this.items",
                ]
              }
            }
          },
          "destination.exclude": 1,
          "destination.items": {
            $reduce: {
              // input: "$condition.destination.countries",
              input: {
                $concatArrays: [
                  "$condition.destinationCities",
                  "$condition.destinationAirports",
                  "$condition.destination.countries",
                ]
              },
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  ["$$this"],
                ]
              }
            }
          },
        },
      }
    ];
  }

  constructor() {
    super(FlightCondition);
  }

  /**
   * 
   * @param {TCondition} origin 
   * @param {TCondition} destination
   * @param {TCondition} airline
   * @param {String} providerNames
   * @param Boolean} isRestricted
   * @returns {Promise<FlightCondition>}
   */
  async createFlightCondition(origin, destination, airline, providerNames, isRestricted = false) {
    const flightCondition = new FlightCondition({ origin, destination, airline, providerNames, isRestricted });

    const lastFlightCondition = await FlightCondition.find().sort({ code: -1 }).limit(1);
    flightCondition.code = !!lastFlightCondition[0] ? lastFlightCondition[0].code + 1 : 0;

    await flightCondition.save();

    return flightCondition;
  }

  /**
   * 
   * @param {Number} page 
   * @param {Number} pageSize 
   * @returns {Promise<FlightCondition[]>}
   */
  async getFlightConditions(page, pageSize) {
    const agrFlightCondition = FlightCondition.aggregate();
    agrFlightCondition.append(this.#getCountryPipeline(true));
    agrFlightCondition.append(this.#getCityPipeline(true));
    agrFlightCondition.append(this.#getAirportPipeline(true));

    agrFlightCondition.append(this.#getCountryPipeline(false));
    agrFlightCondition.append(this.#getCityPipeline(false));
    agrFlightCondition.append(this.#getAirportPipeline(false));

    agrFlightCondition.append(this.#getAirlinePipeline());

    agrFlightCondition.append(this.#getFinalProjection());

    const flightConditions = await pagination.rootPagination(agrFlightCondition, page, pageSize);
    return flightConditions;
  }

  /**
   * 
   * @param {Number} code 
   * @returns {Promise<FlightCondition>}
   */
  async getFlightCondition(code) {
    const agrFlightCondition = FlightCondition.aggregate();
    agrFlightCondition.append({
      $match: {
        code,
      }
    });
    agrFlightCondition.append(this.#getCountryPipeline(true));
    agrFlightCondition.append(this.#getCityPipeline(true));
    agrFlightCondition.append(this.#getAirportPipeline(true));

    agrFlightCondition.append(this.#getCountryPipeline(false));
    agrFlightCondition.append(this.#getCityPipeline(false));
    agrFlightCondition.append(this.#getAirportPipeline(false));

    agrFlightCondition.append(this.#getAirlinePipeline());

    agrFlightCondition.append(this.#getFinalProjection());

    const flightCondition = await agrFlightCondition.exec();
    return flightCondition[0];
  }

  /**
   * 
   * @param {String} origin 
   * @param {String} destination 
   * @returns {Promise<FlightCondition>}
   */
  async findFlightCondition(origin, destination) {
    const agrFlightCondition = FlightCondition.aggregate();
    agrFlightCondition.append({
      $lookup: {
        from: "countries",
        localField: "origin.items",
        foreignField: "code",
        as: "origin.countries",
      }
    });
    agrFlightCondition.append({
      $lookup: {
        from: "countries",
        localField: "destination.items",
        foreignField: "code",
        as: "destination.countries",
      }
    });

    const flightConditions = await agrFlightCondition.exec();


    // const conditions = {
    //   origin: { "origin.items": origin, "origin.exclude": false, "destination.items": { $ne: destination }, "destination.exclude": true },
    //   destination: { "origin.items": { $ne: origin }, "origin.exclude": true, "destination.items": destination, "destination.exclude": false },
    //   origin_destination: { "origin.items": origin, "origin.exclude": false, "destination.items": destination, "destination.exclude": false },
    //   not: { "origin.items": { $ne: origin }, "origin.exclude": true, "destination.items": { $ne: destination }, "destination.exclude": true },
    // };
    // const flightConditions = await this.findMany({ $or: Object.values(conditions) });

    return flightConditions;
  }
};

module.exports = new FlightConditionRepository();
