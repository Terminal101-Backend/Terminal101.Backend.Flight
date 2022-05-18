const { EProvider, EFlightWaypoint, ETravelClass, EFeeType } = require("../constants");
const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { getIpInfo } = require("../services/ip");
const { providerRepository, countryRepository, flightInfoRepository } = require("../repositories");
// const { FlightInfo } = require("../models/documents");
const { amadeus } = require("../services");
const { flightHelper, amadeusHelper, partoHelper, dateTimeHelper, arrayHelper } = require("../helpers");

// NOTE: Flight
// NOTE: Search origin or destination
module.exports.searchOriginDestination = async (req, res) => {
  try {
    let keyword = req.query.keyword ?? "";
    let ipInfo;
    if (!keyword) {
      if (EFlightWaypoint.check("ORIGIN", req.params.waypointType)) {
        const ip = request.getRequestIpAddress(req);
        ipInfo = await getIpInfo(ip);
        console.log({ ip, ipInfo });
        // const ipInfo = await getIpInfo("24.48.0.1");
        if (ipInfo.status === "success") {
          keyword = ipInfo.city;
        }
      } else {
        response.error(res, "keyword_required", 400);
        return;
      }
    }

    let result = await countryRepository.search(keyword, 5);
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
module.exports.appendProviderResult = async (flight, time, searchIndex = -1, page, pageSize) => {
  const flightInfo = await flightInfoRepository.createFlightInfo(
    flight.origin,
    flight.destination,
    time,
  );

  if (searchIndex === -1) {
    searchIndex = flightInfo.searches.push({
      code: await flightInfoRepository.generateUniqueCode(),
      flights: flight.flightDetails,
      filter: flightHelper.getFilterLimitsFromFlightDetailsArray(flight.flightDetails),
    }) - 1;
  } else {
    // TODO: Append result to last search
    // TODO: Sort last search by completed result
    // TODO: Make last search distinct
  }

  await flightInfo.save();

  return {
    searchIndex,
    response: {
      code: flightInfo.searches[searchIndex].code,
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
      flights: arrayHelper.pagination(flight.flightDetails, page, pageSize),
      // AMADEUS_RESULT: result,
    }
  };
};

module.exports.searchFlights = async (req, res) => {
  // TODO: Get providers count from database for active providers
  const activeProviders = await providerRepository.getActiveProviders();
  const activeProviderCount = activeProviders.length;
  let providerNumber = 0;
  let searchIndex = -1;

  if (activeProviders.some(provider => provider.name === EProvider.get("AMADEUS"))) {
    amadeusHelper.searchFlights(req.query).then(async flight => {
      const result = await this.appendProviderResult(flight, req.query.departureDate.toISOString(), searchIndex, req.header("Page"), req.header("PageSize"));
      searchIndex = result.searchIndex;

      if (++providerNumber === activeProviderCount) {
        response.success(res, result.response);
      }
    }).catch(e => {
      response.exception(res, e);
    });
  }

  if (activeProviders.some(provider => provider.name === EProvider.get("PARTO"))) {
    // TODO: Search by Parto
    partoHelper.searchFlights(req.query);
    console.log("Append Parto's result to db");
  }
};

// NOTE: Get filters
module.exports.getFilterLimit = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getSearchByCode(req.params.searchId);

    response.success(res, {
      stops: flightInfo.searches.filter.stops,
      aircrafts: flightInfo.searches.filter.aircrafts,
      airports: flightInfo.searches.filter.airports.map(airport => ({
        code: airport.code,
        name: airport.name,
        description: airport.description,
      })),
      airlines: flightInfo.searches.filter.airlines.map(airline => ({
        code: airline.code,
        name: airline.name,
        description: airline.description,
      })),
      price: {
        min: flightInfo.searches.filter.price.min,
        max: flightInfo.searches.filter.price.max,
      },
      departureTime: {
        min: flightInfo.searches.filter.departureTime.min,
        max: flightInfo.searches.filter.departureTime.max,
      },
      arrivalTime: {
        min: flightInfo.searches.filter.arrivalTime.min,
        max: flightInfo.searches.filter.arrivalTime.max,
      },
      duration: {
        min: flightInfo.searches.filter.duration.min,
        max: flightInfo.searches.filter.duration.max,
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

    const flights = flightInfo.searches.flights.map(flight => {
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
      code: flightInfo.searches.code,
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
        code: flightInfo.flight.code,
        availableSeats: flightInfo.flight.availableSeats,
        currencyCode: flightInfo.flight.currencyCode,
        // price: flightInfo.flight.price,
        price: {
          total: flightInfo.flight.price.total,
          grandTotal: flightInfo.flight.price.grandTotal,
          base: flightInfo.flight.price.base,
          travelerPrices: flightInfo.flight.price.travelerPrices.map(travelerPrice => ({
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
          fees: flightInfo.flight.price.fees.map(fee => ({
            amount: fee.amount,
            type: EFeeType.find(fee.type),
          })),
          taxes: flightInfo.flight.price.taxes.map(tax => ({
            amount: tax.amount,
            code: tax.code,
          })),
        },
        itineraries: flightInfo.flight.itineraries.map(itinerary => ({
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
    const countries = await countryRepository.findMany();
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

