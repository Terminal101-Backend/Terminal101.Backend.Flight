const { EFlightWaypoint, ETravelClass } = require("../constants");
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
        terminal: segment.departure.terminal,
        at: segment.departure.at,
      },
      arrival: {
        airport: !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].airport : { code: segment.arrival.iataCode, name: "UNKNOWN" },
        city: !!airports[segment.arrival.iataCode] ? !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].city : { code: segment.arrival.iataCode, name: "UNKNOWN" } : { code: "UNKNOWN", name: "UNKNOWN" },
        terminal: segment.arrival.terminal,
        at: segment.arrival.at,
      },
    };

    if (!filter.airlines.some(airline => airline.code === segment.carriesCode)) {
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

    // if (new Date(result.departure.at) < (!filter.departureTimeFrom ? Number.POSITIVE_INFINITY : new Date(filter.departureTimeFrom))) {
    //   filter.departureTimeFrom = result.departure.at;
    // }
    // if (new Date(result.departure.at) > (!filter.departureTimeTo ? 0 : new Date(filter.departureTimeTo))) {
    //   filter.departureTimeTo = result.departure.at;
    // }

    // if (new Date(result.arrival.at) < (!filter.arrivalTimeFrom ? Number.POSITIVE_INFINITY : new Date(filter.arrivalTimeFrom))) {
    //   filter.arrivalTimeFrom = result.arrival.at;
    // }
    // if (new Date(result.arrival.at) > (!filter.arrivalTimeTo ? 0 : new Date(filter.arrivalTimeTo))) {
    //   filter.arrivalTimeTo = result.arrival.at;
    // }

    return result;
  };
};

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass, filter) => {
  return (flight, index) => {
    result = {
      code: index,
      availableSeats: flight.numberOfBookableSeats,
      currencyCode: flight.price.currency,
      travelClass,
      price: flight.price.total,
      itineraries: flight.itineraries.map(itinerary => {
        let result = {
          duration: dateTime.convertAmadeusTime(itinerary.duration),
          segments: itinerary.segments.map(makeFlightSegmentsArray(aircrafts, airlines, airports, filter)),
        };

        if (result.duration < filter.durationFrom) {
          filter.durationFrom = result.duration;
        }
        if (result.duration > filter.durationTo) {
          filter.durationTo = result.duration;
        }

        if (new Date(result.segments[0].departure.at) < (!filter.departureTimeFrom ? Number.POSITIVE_INFINITY : new Date(filter.departureTimeFrom))) {
          filter.departureTimeFrom = result.segments[0].departure.at;
        }
        if (new Date(result.segments[0].departure.at) > (!filter.departureTimeTo ? 0 : new Date(filter.departureTimeTo))) {
          filter.departureTimeTo = result.segments[0].departure.at;
        }

        if (new Date(result.segments[0].arrival.at) < (!filter.arrivalTimeFrom ? Number.POSITIVE_INFINITY : new Date(filter.arrivalTimeFrom))) {
          filter.arrivalTimeFrom = result.segments[0].arrival.at;
        }
        if (new Date(result.segments[0].arrival.at) > (!filter.arrivalTimeTo ? 0 : new Date(filter.arrivalTimeTo))) {
          filter.arrivalTimeTo = result.segments[0].arrival.at;
        }

        return result;
      }),
    };

    if (result.price < filter.priceFrom) {
      filter.priceFrom = result.price;
    }
    if (result.price > filter.priceTo) {
      filter.priceTo = result.price;
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
        priceFrom: Number.POSITIVE_INFINITY,
        priceTo: 0,
        departureTimeFrom: undefined,
        departureTimeTo: undefined,
        arrivalTimeFrom: undefined,
        arrivalTimeTo: undefined,
        durationFrom: Number.POSITIVE_INFINITY,
        durationTo: 0,
      };
      const airports = !!result.dictionaries ? await countryRepository.getAirportsByCode([...Object.keys(result.dictionaries.locations), ...stops]) : [];
      const aircrafts = !!result.dictionaries ? result.dictionaries.aircraft : [];
      const carriers = !!result.dictionaries ? result.dictionaries.carriers : [];
      const flightDetails = result.data.map(makeFlightDetailsArray(aircrafts, carriers, airports, req.query.travelClass, filter));

      filter.departureTimeFrom = dateTime.getMinutesFromIsoString(filter.departureTimeFrom);
      filter.departureTimeTo = dateTime.getMinutesFromIsoString(filter.departureTimeTo);

      filter.arrivalTimeFrom = dateTime.getMinutesFromIsoString(filter.arrivalTimeFrom);
      filter.arrivalTimeTo = dateTime.getMinutesFromIsoString(filter.arrivalTimeTo);

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
    priceFrom: flightInfo.searches.filter.priceFrom,
    priceTo: flightInfo.searches.filter.priceTo,
    departureTimeFrom: flightInfo.searches.filter.departureTimeFrom,
    departureTimeTo: flightInfo.searches.filter.departureTimeTo,
    arrivalTimeFrom: flightInfo.searches.filter.arrivalTimeFrom,
    arrivalTimeTo: flightInfo.searches.filter.arrivalTimeTo,
    durationFrom: flightInfo.searches.filter.durationFrom,
    durationTo: flightInfo.searches.filter.durationTo,
  });

  // let stops = 0;
  // let airports = [];
  // let airlines = [];
  // let priceFrom = Number.POSITIVE_INFINITY;
  // let priceTo = 0;
  // let departureTimeFrom = Number.POSITIVE_INFINITY;
  // let departureTimeTo = 0;
  // let arrivalTimeFrom = Number.POSITIVE_INFINITY;
  // let arrivalTimeTo = 0;
  // let durationFrom = Number.POSITIVE_INFINITY;
  // let durationTo = 0;

  // flightInfo.searches.flights.forEach(flight => {
  //   if (flight.price < priceFrom) {
  //     priceFrom = flight.price;
  //   }
  //   if (flight.price > priceTo) {
  //     priceTo = flight.price;
  //   }

  //   flight.itineraries.forEach(itinerary => {
  //     if (itinerary.duration < durationFrom) {
  //       durationFrom = itinerary.duration;
  //     }
  //     if (itinerary.duration > durationTo) {
  //       durationTo = itinerary.duration;
  //     }

  //     itinerary.segments.forEach(segment => {

  //     });
  //   });
  // });

  // response.success(res, {
  //   stops,
  //   airports,
  //   airlines,
  //   priceFrom,
  //   priceTo,
  //   departureTimeFrom,
  //   departureTimeTo,
  //   arrivalTimeFrom,
  //   arrivalTimeTo,
  //   durationFrom,
  //   durationTo,
  // });
}

// NOTE: Filter flights
module.exports.filterFlights = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getSearchByCode(req.params.searchId);

    const flights = flightInfo.searches.flights.map(flight => {
      let itineraries = [];
      if ((!req.query.priceFrom || (flight.price >= req.query.priceFrom)) && (!req.query.priceTo || (flight.price <= req.query.priceTo))) {
        itineraries = flight.itineraries.map(itinerary => {
          let segments = itinerary.segments.some(segment => {
            let result = true;

            result = result && (!req.query.airlineCode || req.query.airlineCode.includes(segment.airlineCode));

            result = result && (!req.query.airports || req.query.airports.includes(segment.departure.airportCode) || req.query.airports.includes(segment.arrival.airportCode));

            return result;
          });

          return {
            duration: itinerary.duration,
            segments: !!segments ? itinerary.segments.map(segment => ({
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
              })),
            })) : [],
          };
        }).filter(itinerary => {
          let result = itinerary.segments.length > 0;

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
        price: flight.price,
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
        price: flightInfo.flight.price,
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

