const BaseRepository = require("../core/baseRepository");
const { FlightCondition, Country } = require("../models/documents");
const pagination = require("../helpers/paginationHelper");

/**
 * @typedef TCondition
 * @property {String[]} items
 * @property {Boolean} exclude
 */

class FlightConditionRepository extends BaseRepository {
  /**
   * @param {Boolean} origin 
   * @param {Boolean} returnArrays = false
   */
  #getConditionCountryPipeline(origin, returnArrays = false) {
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
              cities: !!returnArrays ? 1 : undefined,
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
   * @param {Boolean} returnArrays = false
   */
  #getConditionCityPipeline(origin, returnArrays = false) {
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
                airports: !!returnArrays ? 1 : undefined,
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
  #getConditionAirportPipeline(origin) {
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

  #getConditionAirlinePipeline() {
    return {
      $lookup: {
        from: "airlines",
        as: "airlineInfo",
        localField: "airline.items",
        foreignField: "code",
      }
    };
  }

  #getConditionFinalProjection() {
    const [origins, destinations] = ["origin", "destination"].map(waypoint => [
      {
        $addFields: {
          [`condition.${waypoint}Cities`]: {
            $reduce: {
              input: `$condition.${waypoint}.cities`,
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
      },
      {
        $addFields: {
          [`condition.${waypoint}Airports`]: {
            $reduce: {
              input: `$condition.${waypoint}.airports`,
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
      },
    ]);

    return [
      ...origins,
      ...destinations,
      {
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
                  "$condition.originCities",
                  "$condition.originAirports",
                  "$condition.origin.countries",
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
          "destination.exclude": 1,
          "destination.items": {
            $reduce: {
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

  #getConditionCheckFinalProjection() {
    const [origins, destinations] = ["origin", "destination"].map(waypoint => [
      {
        $addFields: {
          [`condition.${waypoint}CountriesCities`]: {
            $reduce: {
              input: {
                $concatArrays: `$condition.${waypoint}.countries`
              },
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  "$$this.cities",
                ]
              }
            }
          },
        },
      },
      {
        $addFields: {
          [`condition.${waypoint}Cities`]: {
            $reduce: {
              input: `$condition.${waypoint}.cities`,
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
      },
      {
        $addFields: {
          [`condition.${waypoint}CitiesAirports`]: {
            $reduce: {
              input: {
                $concatArrays: [
                  `$condition.${waypoint}CountriesCities`,
                  `$condition.${waypoint}Cities`,
                ]
              },
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  "$$this.airports",
                ]
              }
            }
          },
        },
      },
      {
        $addFields: {
          [`condition.${waypoint}Airports`]: {
            $reduce: {
              input: `$condition.${waypoint}.airports`,
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
      },
    ]);

    return [
      ...origins,
      ...destinations,
      {
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
                  "$condition.originCountriesCities",
                  "$condition.originCitiesAirports",
                  "$condition.originCities",
                  "$condition.originAirports",
                  "$condition.origin.countries",
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
          "destination.exclude": 1,
          "destination.items": {
            $reduce: {
              input: {
                $concatArrays: [
                  "$condition.destinationCountriesCities",
                  "$condition.destinationCitiesAirports",
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
          }
        },
      },
      {
        $project: {
          "origin.items.cities": 0,
          "origin.items.airports": 0,
          "destination.items.cities": 0,
          "destination.items.airports": 0,
        }
      },
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
    agrFlightCondition.append(this.#getConditionCountryPipeline(true));
    agrFlightCondition.append(this.#getConditionCityPipeline(true));
    agrFlightCondition.append(this.#getConditionAirportPipeline(true));

    agrFlightCondition.append(this.#getConditionCountryPipeline(false));
    agrFlightCondition.append(this.#getConditionCityPipeline(false));
    agrFlightCondition.append(this.#getConditionAirportPipeline(false));

    agrFlightCondition.append(this.#getConditionAirlinePipeline());

    agrFlightCondition.append(this.#getConditionFinalProjection());

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
    agrFlightCondition.append(this.#getConditionCountryPipeline(true));
    agrFlightCondition.append(this.#getConditionCityPipeline(true));
    agrFlightCondition.append(this.#getConditionAirportPipeline(true));

    agrFlightCondition.append(this.#getConditionCountryPipeline(false));
    agrFlightCondition.append(this.#getConditionCityPipeline(false));
    agrFlightCondition.append(this.#getConditionAirportPipeline(false));

    agrFlightCondition.append(this.#getConditionAirlinePipeline());

    agrFlightCondition.append(this.#getConditionFinalProjection());

    const flightCondition = await agrFlightCondition.exec();
    return flightCondition[0];
  }

  /**
   * 
   * @param {String} origin 
   * @param {String} destination 
   * @param {Boolean} includeAirports = false
   * @returns {Promise<FlightCondition>}
   */
  async findFlightCondition(origin, destination, includeAirports = true) {
    const airports = {
      origin: [],
      destination: [],
    }

    if (!!includeAirports) {
      const agrCountry = {
        origin: Country.aggregate(),
        destination: Country.aggregate(),
      };
      const waypoints = { origin, destination };

      for (const [waypoint, aggregate] of Object.entries(agrCountry)) {
        aggregate.append({
          $unwind: "$cities"
        });
        aggregate.append({
          $match: {
            "cities.code": waypoints[waypoint]
          }
        });
        aggregate.append({
          $unwind: "$cities.airports"
        });
        aggregate.append({
          $project: {
            code: "$cities.airports.code"
          }
        });
        const result = await aggregate.exec();
        airports[waypoint] = result.map(item => item.code);
      }
    }

    const agrFlightCondition = FlightCondition.aggregate();
    agrFlightCondition.append({
      $match: {
        isActive: { $ne: false },
      }
    });
    agrFlightCondition.append(this.#getConditionCountryPipeline(true, true));
    agrFlightCondition.append(this.#getConditionCityPipeline(true, true));
    agrFlightCondition.append(this.#getConditionAirportPipeline(true));

    agrFlightCondition.append(this.#getConditionCountryPipeline(false, true));
    agrFlightCondition.append(this.#getConditionCityPipeline(false, true));
    agrFlightCondition.append(this.#getConditionAirportPipeline(false));

    agrFlightCondition.append(this.#getConditionAirlinePipeline());

    agrFlightCondition.append(this.#getConditionCheckFinalProjection());

    const conditions = {
      origin_destination: {
        "origin.items.code": {
          $in: [origin, ...airports.origin],
        },
        "origin.exclude": false,
        "destination.items.code": {
          $in: [destination, ...airports.destination],
        },
        "destination.exclude": false
      },
      origin: {
        "origin.items.code": {
          $in: [origin, ...airports.origin],
        },
        "origin.exclude": false,
        "destination.items.code": {
          $ne: destination,
        },
        "destination.exclude": true
      },
      destination: {
        "origin.items.code": {
          $ne: origin,
        },
        "origin.exclude": true,
        "destination.items.code": {
          $in: [destination, ...airports.destination],
        },
        "destination.exclude": false
      },
      none: {
        "origin.items.code": {
          $ne: origin,
        },
        "origin.exclude": true,
        "destination.items.code": {
          $ne: destination,
        },
        "destination.exclude": true
      },
    };

    // const conditions = {
    //   origin_destination: { "origin.items.code": origin, "origin.exclude": false, "destination.items.code": destination, "destination.exclude": false },
    //   origin: { "origin.items.code": origin, "origin.exclude": false, "destination.items.code": { $ne: destination }, "destination.exclude": true },
    //   destination: { "origin.items.code": { $ne: origin }, "origin.exclude": true, "destination.items.code": destination, "destination.exclude": false },
    //   none: { "origin.items.code": { $ne: origin }, "origin.exclude": true, "destination.items.code": { $ne: destination }, "destination.exclude": true },
    // };

    agrFlightCondition.append({
      $match: {
        $or: Object.values(conditions),
      }
    });
    const flightConditions = await agrFlightCondition.exec();

    return flightConditions;
  }
};

module.exports = new FlightConditionRepository();
