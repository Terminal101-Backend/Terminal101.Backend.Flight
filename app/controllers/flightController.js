const { EFlightWaypoint } = require("../constants");
const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { getIpInfo } = require("../services/ip");
const { countryRepository, flightInfoRepository } = require("../repositories");
const { FlightInfo } = require("../models/documents");
const { amadeus } = require("../services");

// NOTE: Flight
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
    const convertTime = time => {
      const reH = /^PT(?:(\d+)H)?/.exec(time);
      const reM = /(?:(\d+)M)?$/.exec(time);
      return parseInt(reH[1] ?? 0) * 60 + parseInt(reM[1] ?? 0);
    };

    let segments = req.query.segments ?? [];
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

    const departureDate = req.query.departureDate.toISOString().split("T")[0];
    const returnDate = req.query.returnDate ? req.query.returnDate.toISOString().split("T")[0] : undefined;

    let result;
    if (!segments || (segments.length === 0)) {
      result = await amadeus.flightOffersSingleSearch(req.query.origin, req.query.destination, departureDate, returnDate, req.query.adults, req.query.children, req.query.infants, req.query.travelClass);
    } else {
      result = await amadeus.flightOffersMultiSearch(req.query.origin, req.query.destination, departureDate, returnDate, segments, req.query.adults, req.query.children, req.query.infants, req.query.travelClass);
    }

    const flightDetails = result.data.map((rec, index) => ({
      availableSeats: rec.numberOfBookableSeats,
      currencyCode: rec.price.currency,
      price: rec.price.total,
      itineraries: rec.itineraries.map(itinerary => ({
        duration: convertTime(itinerary.duration),
        segments: itinerary.segments.map(segment => ({
          duration: convertTime(segment.duration),
          flightNumber: segment.number,
          aircraft: result.dictionaries.aircraft[segment.aircraft.code],
          airline: {
            code: segment.carrierCode,
            name: result.dictionaries.carriers[segment.carrierCode],
          },
          departure: {
            airportCode: segment.departure.iataCode,
            terminal: segment.departure.terminal,
            at: new Date(segment.departure.at) / 1000,
          },
          arrival: {
            airportCode: segment.arrival.iataCode,
            terminal: segment.arrival.terminal,
            at: new Date(segment.arrival.at) / 1000,
          },
        })),
      })),
    }));

    let flightInfo = await flightInfoRepository.findOne({
      originCode: req.query.origin,
      destinationCode: req.query.destination,
      time: req.query.departureDate.toISOString(),
    });

    if (!flightInfo) {
      flightInfo = new FlightInfo({
        originCode: req.query.origin,
        destinationCode: req.query.destination,
        time: req.query.departureDate,
      });
    }

    const searchIndex = flightInfo.searches.push({
      code: await flightInfoRepository.generateUniqueCode(),
      flights: flightDetails,
    }) - 1;

    await flightInfo.save();

    response.success(res, {
      code: flightInfo.searches[searchIndex].code,
      originCode: flightInfo.originCode,
      destinationCode: flightInfo.destinationCode,
      time: new Date(flightInfo.time) / 1000,
      flights: flightDetails,
      // AMADEUS_RESULT: result,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

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
            segments: !!segments ? itinerary.segments : [],
          };
        }).filter(itinerary => {
          let result = itinerary.segments.length > 0;

          const departureTime = itinerary.segments[0].departure.at.getHours() * 60 + itinerary.segments[0].departure.at.getMinutes();

          result = result && (!req.query.departureTimeFrom || (departureTime >= req.query.departureTimeFrom));
          result = result && (!req.query.departureTimeTo || (departureTime <= req.query.departureTimeTo));

          const arrivalTime = itinerary.segments[0].arrival.at.getHours() * 60 + itinerary.segments[0].arrival.at.getMinutes();

          result = result && (!req.query.arrivalTimeFrom || (arrivalTime >= req.query.arrivalTimeFrom));
          result = result && (!req.query.arrivalTimeTo || (arrivalTime <= req.query.arrivalTimeTo));

          result = result && (!req.query.durationFrom || (itinerary.duration >= req.query.durationFrom));
          result = result && (!req.query.durationTo || (itinerary.duration <= req.query.durationTo));

          return result;
        });
      }

      return {
        availableSeats: flight.availableSeats,
        currencyCode: flight.currencyCode,
        price: flight.price,
        itineraries,
      };
    }).filter(flight => flight.itineraries.length > 0);

    response.success(res, {
      code: flightInfo.searches.code,
      originCode: flightInfo.originCode,
      destinationCode: flightInfo.destinationCode,
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
      originCode: flightInfo.originCode,
      destinationCode: flightInfo.destinationCode,
      time: flightInfo.time,
      flight: flightInfo.flight,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get popular flights
module.exports.getPopularFlights = async (req, res) => {
  try {
    const list = await flightInfoRepository.getCachedPopularFlights(req.params.waypointType);

    response.success(res, list.map(flight => ({
      ...flight,
      "time.timestamps": new Date(flight.time).getTime(),
    })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get countries
module.exports.getCountries = async (req, res) => {
  try {
    const countries = await countryRepository.findMany();
    response.success(res, countries.map(country => ({ code: country.code, name: country.name })));
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

