const { EProvider, EFlightWaypoint, ETravelClass, EFeeType } = require("../constants");
const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { getIpInfo } = require("../services/ip");
const { providerRepository, countryRepository, airlineRepository, flightInfoRepository, flightConditionRepository } = require("../repositories");
// const { FlightInfo } = require("../models/documents");
const { amadeus } = require("../services");
const { flightHelper, amadeusHelper, partoHelper, dateTimeHelper, arrayHelper } = require("../helpers");

// NOTE: Flight
// NOTE: Search origin or destination
module.exports.searchOriginDestination = async (req, res) => {
  try {
    let keyword = req.query.keyword ?? "";
    keyword = keyword.trim();
    const isKeywordEmpty = !keyword;
    let ipInfo;
    if (!keyword) {
      if (EFlightWaypoint.check("ORIGIN", req.params.waypointType)) {
        const ip = request.getRequestIpAddress(req);
        ipInfo = await getIpInfo(ip);
        // ipInfo = await getIpInfo("5.239.149.82");
        console.log({ ip, ipInfo });
        if (ipInfo.status === "success") {
          keyword = ipInfo.city;
        }
      } else {
        response.error(res, "keyword_required", 400);
        return;
      }
    }

    let result = await countryRepository.search(keyword, 5);
    if (!!isKeywordEmpty && (result.airports.length === 0)) {
      result = await countryRepository.search(keyword.replace(/-/g, " "), 5);
    }
    if (!!isKeywordEmpty && (result.airports.length === 0)) {
      keyword = ipInfo.country;
      result = await countryRepository.search(keyword, 5)
    }
    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get popular waypoints
module.exports.getPopularWaypoints = async (req, res) => {
  try {
    const list = await flightInfoRepository.getCachedPopularWaypoints(req.params.waypointType);

    response.success(res, list);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Search flights
module.exports.appendProviderResult = async (origin, destination, time, flights, searchCode, page = 0, pageSize) => {
  let flightInfo = await flightInfoRepository.createFlightInfo(
    origin,
    destination,
    time,
    searchCode,
  );

  // TODO: Make last search distinct
  flightInfo.flights = flights;
  flightInfo.filter = flightHelper.getFilterLimitsFromFlightDetailsArray(flights);

  // if (searchCode === -1) {
  //   searchCode = flightInfo.searches.push({
  //     code: await flightInfoRepository.generateUniqueCode(),
  //     flights: flights,
  //     filter: flightHelper.getFilterLimitsFromFlightDetailsArray(flights),
  //   }) - 1;
  // } else {
  //   flightInfo.searches[searchCode].flights = flights;
  //   flightInfo.searches[searchCode].filter = flightHelper.getFilterLimitsFromFlightDetailsArray(flightInfo.searches[searchCode].flights);
  // }

  await flightInfo.save();

  return {
    code: flightInfo.code,
    origin: {
      code: flightInfo.origin.code,
      name: flightInfo.origin.name,
      description: flightInfo.origin.description,
    },
    destination: {
      code: flightInfo.destination.code,
      name: flightInfo.destination.name,
      description: flightInfo.destination.description,
    },
    time: flightInfo.time,
    flights: arrayHelper.pagination(flights.sort((flight1, flight2) => flight1.price.total - flight2.price.total), page, pageSize),
    // AMADEUS_RESULT: result,
  };
};

module.exports.checkIfProviderNotRestrictedForThisRoute = (flightConditions, activeProviders) => {
  return activeProviders.filter(provider => {
    const providerIsRestricted = flightConditions.some(flightCondition => {
      const anyAirlines = !!flightCondition.airline.exclude && (!flightCondition.airline.items || (flightCondition.airline.items.length === 0));
      if (!!anyAirlines) {
        if (!!flightCondition.isRestricted && flightCondition.providerNames.includes(EProvider.find(provider.name))) {
          return true;
        }
        if (!flightCondition.isRestricted && !flightCondition.providerNames.includes(EProvider.find(provider.name))) {
          return true;
        }
        return false;
      } else {
        return false
      };
    });

    return !providerIsRestricted;
  });
};

module.exports.filterFlightDetailsByFlightConditions = (flightConditions, providerName, flightDetails) => {
  let result = flightDetails;

  flightConditions.forEach(flightCondition => {
    result = flightDetails.filter(flightDetails =>
      flightDetails.itineraries.every(itinerary => itinerary.segments.every(segment => {
        // NOTE: Check if airline exclude is false and segment airline is in airlines list
        let foundAirline = !flightCondition.airline.exclude && flightCondition.airline.items.some(airline => airline.code === segment.airline.code);
        // NOTE: Check if airline exclude is true and segment airline is not in airlines list
        foundAirline = foundAirline || (!!flightCondition.airline.exclude && !flightCondition.airline.items.some(airline => airline.code === segment.airline.code));

        if (!!foundAirline) {
          if (!flightCondition.isRestricted && flightCondition.providerNames.includes(providerName)) {
            return true;
          }
          if (!!flightCondition.isRestricted && !flightCondition.providerNames.includes(providerName)) {
            return true;
          }
          return false;
        } else {
          if (!flightCondition.isRestricted && flightCondition.providerNames.includes(providerName)) {
            return false;
          }
          return true;
        }
      }))
    );
  });

  return result;
};

module.exports.searchFlights = async (req, res) => {
  try {
    // response.error(res, "use_socket", 503);
    // return;

    const activeProviders = await providerRepository.getActiveProviders();

    const flightConditionsForAllAirlines = await flightConditionRepository.findFlightCondition(req.query.origin, req.query.destination);
    const notRestrictedProviders = this.checkIfProviderNotRestrictedForThisRoute(flightConditionsForAllAirlines, activeProviders);

    const activeProviderCount = notRestrictedProviders.length;
    const lastSearch = [];
    let hasResult = false;
    let providerNumber = 0;
    let searchCode;
    let result;

    const flightConditions = await flightConditionRepository.findFlightCondition(req.query.origin, req.query.destination, true);

    notRestrictedProviders.forEach(provider => {
      providerHelper = eval(EProvider.find(provider.name).toLowerCase() + "Helper");

      providerHelper.searchFlights(req.query).then(async flight => {
        const flightDetails = this.filterFlightDetailsByFlightConditions(flightConditions, EProvider.find(provider.name), flight.flightDetails);

        lastSearch.push(...flightDetails);
        result = await this.appendProviderResult(flight.origin, flight.destination, req.query.departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize"));
        searchCode = result.code;
        hasResult = true;

        if (++providerNumber === activeProviderCount) {
          response.success(res, result);
        }
      }).catch(e => {
        if (++providerNumber === activeProviderCount) {
          if (!hasResult) {
            response.exception(res, e);
          } else {
            response.success(res, result);
          }
        }
      });
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get filters
module.exports.getFilterLimit = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getSearchByCode(req.params.searchId);

    response.success(res, {
      stops: flightInfo.filter.stops,
      aircrafts: flightInfo.filter.aircrafts,
      airports: flightInfo.filter.airports.map(airport => ({
        code: airport.code,
        name: airport.name,
        description: airport.description,
      })),
      airlines: flightInfo.filter.airlines.map(airline => ({
        code: airline.code,
        name: airline.name,
        description: airline.description,
      })),
      price: {
        min: flightInfo.filter.price.min,
        max: flightInfo.filter.price.max,
      },
      departureTime: {
        min: flightInfo.filter.departureTime.min,
        max: flightInfo.filter.departureTime.max,
      },
      arrivalTime: {
        min: flightInfo.filter.arrivalTime.min,
        max: flightInfo.filter.arrivalTime.max,
      },
      duration: {
        min: flightInfo.filter.duration.min,
        max: flightInfo.filter.duration.max,
      },
    });
  } catch (e) {
    response.exception(res, e);
  }
}

// NOTE: Filter flights
module.exports.filterFlights = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getSearchByCode(req.params.searchId);

    const now = new Date();

    if (now - flightInfo.searchedTime > process.env.SEARCH_TIMEOUT * 60 * 1000) {
      throw "search_expired";
    }

    const flights = flightInfo.flights.map(flight => {
      let itineraries = [];
      if ((!req.query.priceFrom || (flight.price >= req.query.priceFrom)) && (!req.query.priceTo || (flight.price <= req.query.priceTo))) {
        itineraries = flight.itineraries.map(itinerary => ({
          duration: itinerary.duration,
          segments: itinerary.segments.map(segment => ({
            duration: segment.duration,
            flightNumber: segment.flightNumber,
            aircraft: segment.aircraft,
            airline: {
              code: segment.airline.code,
              name: segment.airline.name,
              description: segment.airline.description,
            },
            departure: {
              airport: {
                code: segment.departure.airport.code,
                name: segment.departure.airport.name,
                description: segment.departure.airport.description,
              },
              city: {
                code: segment.departure.city.code,
                name: segment.departure.city.name,
                description: segment.departure.city.description,
              },
              country: {
                code: segment.departure.country.code,
                name: segment.departure.country.name,
                description: segment.departure.country.description,
              },
              terminal: segment.departure.terminal,
              at: segment.departure.at,
            },
            arrival: {
              airport: {
                code: segment.arrival.airport.code,
                name: segment.arrival.airport.name,
                description: segment.arrival.airport.description,
              },
              city: {
                code: segment.arrival.city.code,
                name: segment.arrival.city.name,
                description: segment.arrival.city.description,
              },
              country: {
                code: segment.arrival.country.code,
                name: segment.arrival.country.name,
                description: segment.arrival.country.description,
              },
              terminal: segment.arrival.terminal,
              at: segment.arrival.at,
            },
            stops: segment.stops.map(stop => ({
              duration: stop.duration,
              arrivalAt: stop.arrivalAt,
              departureAt: stop.departureAt,
              airport: {
                code: stop.airport.code,
                name: stop.airport.name,
                description: stop.airport.description,
              },
              city: {
                code: stop.city.code,
                name: stop.city.name,
                description: stop.city.description,
              },
              country: {
                code: stop.country.code,
                name: stop.country.name,
                description: stop.country.description,
              },
            })),
          })),
        })).filter(itinerary => {
          let result = true;

          let segments = itinerary.segments.some(segment => {
            let result = true;
            let airlines = req.query.airlines;
            let airports = req.query.airports;
            let stops = req.query.stops

            if (!!stops && (typeof stops === "string")) {
              stops = stops.split(",").map(stop => parseInt(stop.trim()));
            }

            if (!!airlines && (typeof airlines === "string")) {
              airlines = airlines.split(",").map(airline => airline.trim());
            }

            if (!!airports && (typeof airports === "string")) {
              airports = airports.split(",").map(airport => airport.trim());
            }

            result = result && (!stops || stops.includes(segment.stops.length));

            result = result && (!airlines || airlines.includes(segment.airline.code));

            result = result && (!airports || airports.includes(segment.departure.airport.code) || airports.includes(segment.arrival.airport.code));

            return result;
          });

          if (!segments) {
            return false;
          }

          const departureTime = dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].departure.at);

          result = result && (!req.query.departureTimeFrom || (departureTime >= req.query.departureTimeFrom));
          result = result && (!req.query.departureTimeTo || (departureTime <= req.query.departureTimeTo));

          const arrivalTime = dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].arrival.at);

          result = result && (!req.query.arrivalTimeFrom || (arrivalTime >= req.query.arrivalTimeFrom));
          result = result && (!req.query.arrivalTimeTo || (arrivalTime <= req.query.arrivalTimeTo));

          result = result && (!req.query.durationFrom || (itinerary.duration >= req.query.durationFrom));
          result = result && (!req.query.durationTo || (itinerary.duration <= req.query.durationTo));

          return result;
        });
      }

      return {
        code: flight.code,
        availableSeats: flight.availableSeats,
        travelClass: ETravelClass.find(flight.travelClass),
        currencyCode: flight.currencyCode,
        price: {
          total: flight.price.total,
          grandTotal: flight.price.grandTotal,
          base: flight.price.base,
          travelerPrices: flight.price.travelerPrices.map(travelerPrice => ({
            total: travelerPrice.total,
            base: travelerPrice.base,
            fees: travelerPrice.fees.map(fee => ({
              amount: fee.amount,
              type: EFeeType.find(fee.type),
            })),
            taxes: travelerPrice.taxes.map(tax => ({
              amount: tax.amount,
              code: tax.code,
            })),
          })),
          fees: flight.price.fees.map(fee => ({
            amount: fee.amount,
            type: EFeeType.find(fee.type),
          })),
          taxes: flight.price.taxes.map(tax => ({
            amount: tax.amount,
            code: tax.code,
          })),
        },
        itineraries,
      };
    }).filter(flight => flight.itineraries.length > 0);

    response.success(res, {
      code: flightInfo.code,
      origin: {
        code: flightInfo.origin.code,
        name: flightInfo.origin.name,
        description: flightInfo.origin.description,
      },
      destination: {
        code: flightInfo.destination.code,
        name: flightInfo.destination.name,
        description: flightInfo.destination.description,
      },
      time: flightInfo.time,
      flights: arrayHelper.pagination(flights, req.header("Page"), req.header("PageSize")),
      // flights,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific flight's price
module.exports.getFlightPrice = async (req, res) => {
  try {
    const amadeusFlightObject = await flightInfoRepository.regenerateAmadeusFlightOfferObject(req.params.searchId, req.params.flightCode);

    const result = await amadeus.updateFlightPrice(amadeusFlightObject);

    if (!!result.data && !!result.data.flightOffers && (result.data.flightOffers.length > 0)) {
      const price = makePriceObject(result.data.flightOffers[0].price, result.data.flightOffers[0].travelerPricings);

      response.success(res, price);
    } else {
      response.success(res, {});
    }
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific flight
module.exports.getFlight = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getFlight(req.params.searchId, req.params.flightCode);

    if (!flightInfo) {
      response.error(res, "flight_not_found", 404);
      return;
    }

    response.success(res, {
      code: req.params.searchId,
      origin: {
        code: flightInfo.origin.code,
        name: flightInfo.origin.name,
        description: flightInfo.origin.description,
      },
      destination: {
        code: flightInfo.destination.code,
        name: flightInfo.destination.name,
        description: flightInfo.destination.description,
      },
      time: flightInfo.time,
      flight: {
        code: flightInfo.flights.code,
        availableSeats: flightInfo.flights.availableSeats,
        currencyCode: flightInfo.flights.currencyCode,
        // price: flightInfo.flights.price,
        price: {
          total: flightInfo.flights.price.total,
          grandTotal: flightInfo.flights.price.grandTotal,
          base: flightInfo.flights.price.base,
          travelerPrices: flightInfo.flights.price.travelerPrices.map(travelerPrice => ({
            type: travelerPrice.travelerType,
            total: travelerPrice.total,
            base: travelerPrice.base,
            fees: travelerPrice.fees.map(fee => ({
              amount: fee.amount,
              type: EFeeType.find(fee.type),
            })),
            taxes: travelerPrice.taxes.map(tax => ({
              amount: tax.amount,
              code: tax.code,
            })),
          })),
          fees: flightInfo.flights.price.fees.map(fee => ({
            amount: fee.amount,
            type: EFeeType.find(fee.type),
          })),
          taxes: flightInfo.flights.price.taxes.map(tax => ({
            amount: tax.amount,
            code: tax.code,
          })),
        },
        itineraries: flightInfo.flights.itineraries.map(itinerary => ({
          duration: itinerary.duration,
          segments: itinerary.segments.map(segment => ({
            duration: segment.duration,
            flightNumber: segment.flightNumber,
            aircraft: segment.aircraft,
            airline: {
              code: segment.airline.code,
              name: segment.airline.name,
              description: segment.airline.description,
            },
            departure: {
              airport: {
                code: segment.departure.airport.code,
                name: segment.departure.airport.name,
                description: segment.departure.airport.description,
              },
              city: {
                code: segment.departure.city.code,
                name: segment.departure.city.name,
                description: segment.departure.city.description,
              },
              country: {
                code: segment.departure.country.code,
                name: segment.departure.country.name,
                description: segment.departure.country.description,
              },
              terminal: segment.departure.terminal,
              at: segment.departure.at,
            },
            arrival: {
              airport: {
                code: segment.arrival.airport.code,
                name: segment.arrival.airport.name,
                description: segment.arrival.airport.description,
              },
              city: {
                code: segment.arrival.city.code,
                name: segment.arrival.city.name,
                description: segment.arrival.country.description,
              },
              country: {
                code: segment.arrival.country.code,
                name: segment.arrival.country.name,
                description: segment.arrival.city.description,
              },
              terminal: segment.arrival.terminal,
              at: segment.arrival.at,
            },
            stops: segment.stops.map(stop => ({
              duration: stop.duration,
              arrivalAt: stop.arrivalAt,
              departureAt: stop.departureAt,
              airport: {
                code: stop.airport.code,
                name: stop.airport.name,
                description: stop.airport.description,
              },
              city: {
                code: stop.city.code,
                name: stop.city.name,
                description: stop.city.description,
              },
              country: {
                code: stop.country.code,
                name: stop.country.name,
                description: stop.country.description,
              },
            })),
          })),
        })),
      }
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get popular flights
module.exports.getPopularFlights = async (req, res) => {
  try {
    const list = await flightInfoRepository.getCachedPopularFlights(req.params.waypointType);

    response.success(res, list);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get countries
module.exports.getCountries = async (req, res) => {
  try {
    const countries = await countryRepository.findMany({}, "name");
    response.success(res, countries.map(country => ({ code: country.code, name: country.name, dialingCode: country.dialingCode })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get cities of country
module.exports.getCities = async (req, res) => {
  try {
    const country = await countryRepository.findOne({ code: req.params.code });
    response.success(res, country.cities.map(city => ({ code: city.code, name: city.name })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get airports of city
module.exports.getAirports = async (req, res) => {
  try {
    const country = await countryRepository.getAirports(req.params.countryCode, req.params.cityCode);

    response.success(res, country.cities.airports.map(airport => ({ code: airport.code, name: airport.name })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get airlines
module.exports.getAirlines = async (req, res) => {
  try {
    const airline = await airlineRepository.findMany();

    response.success(res, airline.map(airline => ({ code: airline.code, name: airline.name, description: airline.description })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get covid 19 area report
module.exports.restrictionCovid19 = async (req, res) => {
  try {
    const report = await amadeus.covid19AreaReport(req.params.countryCode, req.params.cityCode);

    response.success(res, report);
  } catch (e) {
    response.exception(res, e);
  }
};

module.exports.flightCreateOrder = async (req, res) => {
  try {
    const report = await amadeus.flightCreateOrder(req.body);

    response.success(res, report);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Flight
// NOTE: Search origin or destination by Amadeus
module.exports.searchOriginDestinationAmadeus = async (req, res) => {
  try {
    let keyword = req.query.keyword ?? "";
    const isKeywordEmpty = !keyword;
    let ipInfo;
    if (!keyword) {
      if (EFlightWaypoint.check("ORIGIN", req.params.waypointType)) {
        const ip = request.getRequestIpAddress(req);
        ipInfo = await getIpInfo(ip);
        // ipInfo = await getIpInfo("5.239.149.82");
        console.log({ ip, ipInfo });
        if (ipInfo.status === "success") {
          keyword = ipInfo.city;
        }
      } else {
        response.error(res, "keyword_required", 400);
        return;
      }
    }
    const { data: result } = await amadeus.searchAirportAndCityWithAccessToken(keyword);
    const { data: resultTransformed } = transformDataAmadeus(result);
    response.success(res, resultTransformed);
  } catch (e) {
    response.exception(res, e);
  }


};

//Internal Function
function transformDataAmadeus(data) {
  const newData = [];

  data.forEach(element => {
    newData.push({
      subType: element.subType,
      name: element.name,
      code: element.iataCode,
      geoCode: element.geoCode,
      address: element.address
    })
  });


  return {
    data: newData
  };
}

