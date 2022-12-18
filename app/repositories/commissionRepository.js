const BaseRepository = require("../core/baseRepository");
const { Commission, Country } = require("../models/documents");
const pagination = require("../helpers/paginationHelper");
const filterHelper = require("../helpers/filterHelper");

/**
 * @typedef TCondition
 * @property {String[]} items
 * @property {Boolean} exclude
 */

class CommissionRepository extends BaseRepository {
  /**
   * @param {Boolean} waypoint 
   * @param {Boolean} returnArrays = false
   */
  #getConditionCountryPipeline(waypoint, returnArrays = false) {
    return {
      $lookup: {
        from: "countries",
        as: `condition.${!!waypoint ? "origin" : "destination"}.countries`,
        let: {
          conditionItems: `$${!!waypoint ? "origin" : "destination"}.items`,
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
   * @param {Boolean} waypoint 
   * @param {Boolean} returnArrays = false
   */
  #getConditionCityPipeline(waypoint, returnArrays = false) {
    return {
      $lookup: {
        from: "countries",
        as: `condition.${!!waypoint ? "origin" : "destination"}.cities`,
        let: {
          conditionItems: `$${!!waypoint ? "origin" : "destination"}.items`,
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
   * @param {Boolean} waypoint 
   */
  #getConditionAirportPipeline(waypoint) {
    return {
      $lookup: {
        from: "countries",
        as: `condition.${!!waypoint ? "origin" : "destination"}.airports`,
        let: {
          conditionItems: `$${!!waypoint ? "origin" : "destination"}.items`,
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
          business: 1,
          businessCode: 1,
          value: 1,
          isActive: 1,
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
          value: 1,
          providerNames: 1,
          business: 1,
          businessCode: 1,
          isActive: 1,
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
    super(Commission);
  }

  /**
   * 
   * @param {TCondition} origin 
   * @param {TCondition} destination
   * @param {TCondition} airline
   * @param {String} providerNames
   * @returns {Promise<Commission>}
   */
  async createCommission(origin, destination, airline, providerNames, business, businessCode, value) {
    const commission = new Commission({ origin, destination, airline, providerNames, business, businessCode: businessCode ?? "ADMIN", value });

    const lastCommission = await Commission.find().sort({ code: -1 }).limit(1);
    commission.code = !!lastCommission[0] ? lastCommission[0].code + 1 : 0;

    await commission.save();

    return commission;
  }

  /**
   * 
   * @param {Number} page 
   * @param {Number} pageSize 
   * @param {{field: value}[]} filters
   * @param {String} sort
   * @returns {Promise<Commission[]>}
   */
  async getCommissions(page, pageSize, filters, sort) {
    const agrCommission = Commission.aggregate();
    agrCommission.append(this.#getConditionCountryPipeline(true));
    agrCommission.append(this.#getConditionCityPipeline(true));
    agrCommission.append(this.#getConditionAirportPipeline(true));

    agrCommission.append(this.#getConditionCountryPipeline(false));
    agrCommission.append(this.#getConditionCityPipeline(false));
    agrCommission.append(this.#getConditionAirportPipeline(false));

    agrCommission.append(this.#getConditionAirlinePipeline());

    agrCommission.append(this.#getConditionFinalProjection());

    filterHelper.filterAndSort(agrCommission, filters, sort);
    const commissions = await pagination.rootPagination(agrCommission, page, pageSize);
    return commissions;
  }

  /**
   * 
   * @param {Number} code 
   * @returns {Promise<Commission>}
   */
  async getCommission(code) {
    const agrCommission = Commission.aggregate();
    agrCommission.append({
      $match: {
        code,
      }
    });
    agrCommission.append(this.#getConditionCountryPipeline(true));
    agrCommission.append(this.#getConditionCityPipeline(true));
    agrCommission.append(this.#getConditionAirportPipeline(true));

    agrCommission.append(this.#getConditionCountryPipeline(false));
    agrCommission.append(this.#getConditionCityPipeline(false));
    agrCommission.append(this.#getConditionAirportPipeline(false));

    agrCommission.append(this.#getConditionAirlinePipeline());

    agrCommission.append(this.#getConditionFinalProjection());

    const commission = await agrCommission.exec();
    return commission[0];
  }

  /**
   * 
   * @param {String} origin 
   * @param {String} destination 
   * @returns {Promise<Commission>}
   */
  async findCommission(origin, destination, businessCode) {
    const airports = {
      origin: [],
      destination: [],
    }

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

    const agrCommission = Commission.aggregate();
    agrCommission.append({
      $match: {
        isActive: { $ne: false },
      }
    });

    if (!businessCode) {
      agrCommission.append({
        $match: {
          "business.items": [],
          "business.exclude": false,
        }
      });
    } else {
      agrCommission.append({
        $match: {
          $or: [
            {
              "business.items": businessCode,
              "business.exclude": false,
            }, {
              "business.items": { $ne: businessCode },
              "business.exclude": true,
            }
          ]
        }
      });
    }

    agrCommission.append(this.#getConditionCountryPipeline(true, true));
    agrCommission.append(this.#getConditionCityPipeline(true, true));
    agrCommission.append(this.#getConditionAirportPipeline(true));

    agrCommission.append(this.#getConditionCountryPipeline(false, true));
    agrCommission.append(this.#getConditionCityPipeline(false, true));
    agrCommission.append(this.#getConditionAirportPipeline(false));

    agrCommission.append(this.#getConditionAirlinePipeline());

    agrCommission.append(this.#getConditionCheckFinalProjection());

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

    agrCommission.append({
      $match: {
        $or: Object.values(conditions),
      }
    });
    const commissions = await agrCommission.exec();

    return commissions;
  }
};

module.exports = new CommissionRepository();
