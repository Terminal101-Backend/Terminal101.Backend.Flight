const { EFlightWaypoint, ETravelClass, EFeeType } = require("../constants");
const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const dateTime = require("../helpers/dateTimeHelper");
const { getIpInfo } = require("../services/ip");
const { countryRepository, flightInfoRepository } = require("../repositories");
const { FlightInfo } = require("../models/documents");
const { amadeus } = require("../services");

// NOTE: Flight
const makeSegmentsArray = segments => {
  segments = segments ?? [];
  if (!Array.isArray(segments)) {
    try {
      segments = segments.split(",");
    } catch (e) {
      segments = [segments];
    }
  };
  segments = segments.map(segment => {
    const segment_date = segment.trim().split(":");
    return {
      originCode: segment_date[0],
      destinationCode: segment_date[1],
      date: segment_date[2],
    };
  });

  return segments;
};

const makeSegmentStopsArray = airports => {
  return stop => ({
    description: stop.description,
    duration: dateTime.convertAmadeusTime(stop.duration),
    arrivalAt: stop.arrivalAt,
    departureAt: stop.departureAt,
    airport: !!airports[stop.iataCode] ? airports[stop.iataCode].airport : { code: stop.iataCode, name: "UNKNOWN" },
    city: !!airports[stop.iataCode] ? airports[stop.iataCode].city : { code: "UNKNOWN", name: "UNKNOWN" },
    country: !!airports[stop.iataCode] ? airports[stop.iataCode].country : { code: "UNKNOWN", name: "UNKNOWN" },
  });
};

const makeFlightSegmentsArray = (aircrafts, airlines, airports, filter) => {
  return segment => {
    let result = {
      duration: dateTime.convertAmadeusTime(segment.duration),
      flightNumber: segment.number,
      aircraft: aircrafts[segment.aircraft.code],
      airline: {
        code: segment.carrierCode,
        name: airlines[segment.carrierCode],
      },
      stops: (segment.stops ?? []).map(makeSegmentStopsArray(airports)),
      departure: {
        airport: !!airports[segment.departure.iataCode] ? airports[segment.departure.iataCode].airport : { code: segment.departure.iataCode, name: "UNKNOWN" },
        city: !!airports[segment.departure.iataCode] ? airports[segment.departure.iataCode].city : { code: "UNKNOWN", name: "UNKNOWN" },
        country: !!airports[segment.departure.iataCode] ? airports[segment.departure.iataCode].country : { code: "UNKNOWN", name: "UNKNOWN" },
        terminal: segment.departure.terminal,
        at: segment.departure.at,
      },
      arrival: {
        airport: !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].airport : { code: segment.arrival.iataCode, name: "UNKNOWN" },
        city: !!airports[segment.arrival.iataCode] ? !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].city : { code: segment.arrival.iataCode, name: "UNKNOWN" } : { code: "UNKNOWN", name: "UNKNOWN" },
        country: !!airports[segment.arrival.iataCode] ? !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].country : { code: segment.arrival.iataCode, name: "UNKNOWN" } : { code: "UNKNOWN", name: "UNKNOWN" },
        terminal: segment.arrival.terminal,
        at: segment.arrival.at,
      },
    };

    if (!filter.airlines.some(airline => airline.code === segment.carrierCode)) {
      filter.airlines.push({
        code: segment.carrierCode,
        name: airlines[segment.carrierCode]
      });
    }

    if (!filter.airports.some(airport => airport.code === segment.departure.iataCode)) {
      filter.airports.push(
        !!airports[segment.departure.iataCode]
          ? airports[segment.departure.iataCode].airport
          : {
            code: segment.departure.iataCode,
            name: "UNKNOWN"
          });
    }

    if (!filter.airports.some(airport => airport.code === segment.arrival.iataCode)) {
      filter.airports.push(
        !!airports[segment.arrival.iataCode]
          ? airports[segment.arrival.iataCode].airport
          : {
            code: segment.arrival.iataCode,
            name: "UNKNOWN"
          });
    }

    if (!filter.aircrafts.includes(aircrafts[segment.aircraft.code])) {
      filter.aircrafts.push(aircrafts[segment.aircraft.code]);
    }

    if (!filter.stops.includes(result.stops.length)) {
      filter.stops.push(result.stops.length);
    }

    // if (new Date(result.departure.at) < (!filter.departureTime.min ? Number.POSITIVE_INFINITY : new Date(filter.departureTime.min))) {
    //   filter.departureTime.min = result.departure.at;
    // }
    // if (new Date(result.departure.at) > (!filter.departureTime.max ? 0 : new Date(filter.departureTime.max))) {
    //   filter.departureTime.max = result.departure.at;
    // }

    // if (new Date(result.arrival.at) < (!filter.arrivalTime.min ? Number.POSITIVE_INFINITY : new Date(filter.arrivalTime.min))) {
    //   filter.arrivalTime.min = result.arrival.at;
    // }
    // if (new Date(result.arrival.at) > (!filter.arrivalTime.max ? 0 : new Date(filter.arrivalTime.max))) {
    //   filter.arrivalTime.max = result.arrival.at;
    // }

    return result;
  };
};

const makePriceObject = (flightPrice, travelerPricings) => ({
  total: parseFloat(flightPrice.total),
  grandTotal: parseFloat(flightPrice.grandTotal),
  base: parseFloat(flightPrice.base),
  fees: (flightPrice.fees ?? []).map(fee => ({
    amount: parseFloat(fee.amount),
    type: fee.type,
  })),
  taxes: (flightPrice.taxes ?? []).map(tax => ({
    amount: parseFloat(tax.amount),
    code: tax.code,
  })),
  travelerPrices: travelerPricings.map(travelerPrice => {
    let travelerType;
    switch (travelerPrice.travelerType) {
      case "CHILD":
        travelerType = "CHILD";
        break;

      case "HELD_INFANT":
      case "SEATED_INFANT":
        travelerType = "INFANT";
        break;

      case "ADULT":
      case "SENIOR":
        travelerType = "ADULT";
        break;

      default:
    }

    return {
      total: parseFloat(travelerPrice.price.total),
      base: parseFloat(travelerPrice.price.base),
      travelerType,
      fees: (travelerPrice.price.fees ?? []).map(fee => ({
        amount: parseFloat(fee.amount),
        type: fee.type,
      })),
      taxes: (travelerPrice.price.taxes ?? []).map(tax => ({
        amount: parseFloat(tax.amount),
        code: tax.code,
      })),
    }
  }),
});

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass, filter) => {
  return (flight, index) => {
    result = {
      code: index,
      availableSeats: flight.numberOfBookableSeats,
      currencyCode: flight.price.currency,
      travelClass,
      price: makePriceObject(flight.price, flight.travelerPricings),
      itineraries: flight.itineraries.map(itinerary => {
        let result = {
          duration: dateTime.convertAmadeusTime(itinerary.duration),
          segments: itinerary.segments.map(makeFlightSegmentsArray(aircrafts, airlines, airports, filter)),
        };

        if (result.duration < filter.duration.min) {
          filter.duration.min = result.duration;
        }
        if (result.duration > filter.duration.max) {
          filter.duration.max = result.duration;
        }

        if (dateTime.getMinutesFromIsoString(result.segments[0].departure.at) < (!filter.departureTime.min ? Number.POSITIVE_INFINITY : dateTime.getMinutesFromIsoString(filter.departureTime.min))) {
          filter.departureTime.min = result.segments[0].departure.at;
        }
        if (dateTime.getMinutesFromIsoString(result.segments[0].departure.at) > (!filter.departureTime.max ? 0 : dateTime.getMinutesFromIsoString(filter.departureTime.max))) {
          filter.departureTime.max = result.segments[0].departure.at;
        }

        if (dateTime.getMinutesFromIsoString(result.segments[0].arrival.at) < (!filter.arrivalTime.min ? Number.POSITIVE_INFINITY : dateTime.getMinutesFromIsoString(filter.arrivalTime.min))) {
          filter.arrivalTime.min = result.segments[0].arrival.at;
        }
        if (dateTime.getMinutesFromIsoString(result.segments[0].arrival.at) > (!filter.arrivalTime.max ? 0 : dateTime.getMinutesFromIsoString(filter.arrivalTime.max))) {
          filter.arrivalTime.max = result.segments[0].arrival.at;
        }

        return result;
      }),
    };

    if (result.price < filter.price.min) {
      filter.price.min = result.price;
    }
    if (result.price > filter.price.max) {
      filter.price.max = result.price;
    }

    return result;
  };
};

// NOTE: Search origin or destination
module.exports.searchOriginDestination = async (req, res) => {
  try {
    let keyword = req.query.keyword ?? "";
    if (!keyword) {
      if (EFlightWaypoint.check("ORIGIN", req.params.waypointType)) {
        const ip = request.getRequestIpAddress(req);
        const ipInfo = await getIpInfo("24.48.0.1");
        if (ipInfo.status === "success") {
          keyword = ipInfo.city;
        }
      } else {
        response.error(res, "keyword_required", 400);
        return;
      }
    }

    const result = await countryRepository.search(keyword, 5);
    // const reKeyword = new RegExp(`.*${keyword}.*`, "i");

    // const foundCountries = result.filter(country => reKeyword.test(`${country.name}|${country.code}`));
    // const distinctCountries = foundCountries.reduce((list, country) => ({ ...list, [country.code]: { name: country.name, cities: country.countryInfo.cities } }), {});
    // const countriesArray = Object.entries(distinctCountries).map(country => ({ code: country[0], name: country[1].name, cities: country[1].cities }));

    // const foundCities = result.filter(country => reKeyword.test(`${country.cities.name}|${country.cities.code}`));
    // const distinctCities = foundCities.reduce((list, country) => ({ ...list, [country.cities.code]: country.cities.name }), {});
    // const citiesArray = Object.entries(distinctCities).map(city => ({ code: city[0], name: city[1] }));

    // const foundAirports = result.filter(country => reKeyword.test(`${country.cities.airports.name}|${country.cities.airports.code}`));
    // const distinctAirports = foundAirports.reduce((list, country) => ({ ...list, [country.cities.airports.code]: country.cities.airports.name }), {});
    // const airportsArray = Object.entries(distinctAirports).map(airport => ({ code: airport[0], name: airport[1] }));

    // response.success(res, { countries: countriesArray, cities: citiesArray, airports: airportsArray });
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
module.exports.searchFlights = async (req, res) => {
  try {
    let segments = makeSegmentsArray(req.query.segments);

    const departureDate = dateTime.excludeDateFromIsoString(req.query.departureDate.toISOString());
    const returnDate = dateTime.excludeDateFromIsoString(req.query.returnDate ? req.query.returnDate.toISOString() : "");

    let result;
    if (!segments || (segments.length === 0)) {
      result = await amadeus.flightOffersSingleSearch(req.query.origin, req.query.destination, departureDate, returnDate, req.query.adults, req.query.children, req.query.infants, req.query.travelClass);
    } else {
      result = await amadeus.flightOffersMultiSearch(req.query.origin, req.query.destination, departureDate, returnDate, segments, req.query.adults, req.query.children, req.query.infants, req.query.travelClass);
    }

    if (!!result.data && (result.data.length > 0)) {
      const stops = result.data
        .reduce((res, cur) => [...res, ...cur.itineraries], [])
        .reduce((res, cur) => [...res, ...cur.segments], [])
        .filter(segment => !!segment.stops)
        .reduce((res, cur) => [...res, ...cur.stops], [])
        .map(stop => stop.iataCode);

      const filter = {
        stops: [],
        aircrafts: [],
        airports: [],
        airlines: [],
        price: {
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
        },
        departureTime: {
          min: undefined,
          max: undefined,
        },
        arrivalTime: {
          min: undefined,
          max: undefined,
        },
        duration: {
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
        },
        // priceFrom: Number.POSITIVE_INFINITY,
        // priceTo: 0,
        // departureTimeFrom: undefined,
        // departureTimeTo: undefined,
        // arrivalTimeFrom: undefined,
        // arrivalTimeTo: undefined,
        // durationFrom: Number.POSITIVE_INFINITY,
        // durationTo: 0,
      };
      const airports = !!result.dictionaries ? await countryRepository.getAirportsByCode([...Object.keys(result.dictionaries.locations), ...stops]) : [];
      const aircrafts = !!result.dictionaries ? result.dictionaries.aircraft : [];
      const carriers = !!result.dictionaries ? result.dictionaries.carriers : [];
      const flightDetails = result.data.map(makeFlightDetailsArray(aircrafts, carriers, airports, req.query.travelClass, filter));

      filter.departureTime.min = dateTime.getMinutesFromIsoString(filter.departureTime.min);
      filter.departureTime.max = dateTime.getMinutesFromIsoString(filter.departureTime.max);

      filter.arrivalTime.min = dateTime.getMinutesFromIsoString(filter.arrivalTime.min);
      filter.arrivalTime.max = dateTime.getMinutesFromIsoString(filter.arrivalTime.max);

      let origin;
      let destination;
      origin = await countryRepository.getCityByCode(req.query.origin);
      destination = await countryRepository.getCityByCode(req.query.destination);

      if (!origin) {
        origin = !!airports[req.query.origin] ? airports[req.query.origin].city : { code: "UNKNOWN", name: "UNKNOWN" };
      }

      if (!destination) {
        destination = !!airports[req.query.destination] ? airports[req.query.destination].city : { code: "UNKNOWN", name: "UNKNOWN" };
      }

      let flightInfo = await flightInfoRepository.findOne({
        origin,
        destination,
        time: req.query.departureDate.toISOString(),
      });

      if (!flightInfo) {
        flightInfo = new FlightInfo({
          origin,
          destination,
          time: req.query.departureDate,
        });
      }

      const searchIndex = flightInfo.searches.push({
        code: await flightInfoRepository.generateUniqueCode(),
        flights: flightDetails,
        filter,
      }) - 1;

      await flightInfo.save();

      response.success(res, {
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
        flights: flightDetails,
        // AMADEUS_RESULT: result,
      });
    } else {
      response.success(res, {});
    }
  } catch (e) {
    response.exception(res, e);
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

          const departureTime = dateTime.getMinutesFromIsoString(itinerary.segments[0].departure.at);

          result = result && (!req.query.departureTimeFrom || (departureTime >= req.query.departureTimeFrom));
          result = result && (!req.query.departureTimeTo || (departureTime <= req.query.departureTimeTo));

          const arrivalTime = dateTime.getMinutesFromIsoString(itinerary.segments[0].arrival.at);

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
      flights,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific flight
module.exports.getFlight = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getFlight(req.params.searchId, req.params.flightIndex);

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

