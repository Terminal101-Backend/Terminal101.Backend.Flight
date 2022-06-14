const dateTimeHelper = require("./dateTimeHelper");
const {
  amadeus
} = require("../services");
const {
  countryRepository
} = require("../repositories");
const {
  EProvider
} = require("../constants");

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
    duration: dateTimeHelper.convertAmadeusTime(stop.duration),
    arrivalAt: stop.arrivalAt,
    departureAt: stop.departureAt,
    airport: !!airports[stop.iataCode] ? airports[stop.iataCode].airport : {
      code: stop.iataCode,
      name: "UNKNOWN"
    },
    city: !!airports[stop.iataCode] ? airports[stop.iataCode].city : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
    country: !!airports[stop.iataCode] ? airports[stop.iataCode].country : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
  });
};

const makeFlightSegmentsArray = (aircrafts, airlines, airports) => {
  return segment => {
    let result = {
      duration: dateTimeHelper.convertAmadeusTime(segment.duration),
      flightNumber: segment.number,
      aircraft: aircrafts[segment.aircraft.code],
      airline: {
        code: segment.carrierCode,
        name: airlines[segment.carrierCode],
      },
      stops: (segment.stops ?? []).map(makeSegmentStopsArray(airports)),
      departure: {
        airport: !!airports[segment.departure.iataCode] ? airports[segment.departure.iataCode].airport : {
          code: segment.departure.iataCode,
          name: "UNKNOWN"
        },
        city: !!airports[segment.departure.iataCode] ? airports[segment.departure.iataCode].city : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        country: !!airports[segment.departure.iataCode] ? airports[segment.departure.iataCode].country : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        terminal: segment.departure.terminal,
        at: segment.departure.at,
      },
      arrival: {
        airport: !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].airport : {
          code: segment.arrival.iataCode,
          name: "UNKNOWN"
        },
        city: !!airports[segment.arrival.iataCode] ? !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].city : {
          code: segment.arrival.iataCode,
          name: "UNKNOWN"
        } : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        country: !!airports[segment.arrival.iataCode] ? !!airports[segment.arrival.iataCode] ? airports[segment.arrival.iataCode].country : {
          code: segment.arrival.iataCode,
          name: "UNKNOWN"
        } : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        terminal: segment.arrival.terminal,
        at: segment.arrival.at,
      },
    };

    // if (!filter.airlines.some(airline => airline.code === segment.carrierCode)) {
    //   filter.airlines.push({
    //     code: segment.carrierCode,
    //     name: airlines[segment.carrierCode]
    //   });
    // }

    // if (!filter.airports.some(airport => airport.code === segment.departure.iataCode)) {
    //   filter.airports.push(
    //     !!airports[segment.departure.iataCode]
    //       ? airports[segment.departure.iataCode].airport
    //       : {
    //         code: segment.departure.iataCode,
    //         name: "UNKNOWN"
    //       });
    // }

    // if (!filter.airports.some(airport => airport.code === segment.arrival.iataCode)) {
    //   filter.airports.push(
    //     !!airports[segment.arrival.iataCode]
    //       ? airports[segment.arrival.iataCode].airport
    //       : {
    //         code: segment.arrival.iataCode,
    //         name: "UNKNOWN"
    //       });
    // }

    // if (!filter.aircrafts.includes(aircrafts[segment.aircraft.code])) {
    //   filter.aircrafts.push(aircrafts[segment.aircraft.code]);
    // }

    // if (!filter.stops.includes(result.stops.length)) {
    //   filter.stops.push(result.stops.length);
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

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass = "ECONOMY") => {
  return (flight, index) => {
    result = {
      code: `AMD-${index}`,
      availableSeats: flight.numberOfBookableSeats,
      currencyCode: flight.price.currency,
      travelClass,
      provider: EProvider.get("AMADEUS"),
      price: makePriceObject(flight.price, flight.travelerPricings),
      itineraries: flight.itineraries.map(itinerary => {
        let result = {
          duration: dateTimeHelper.convertAmadeusTime(itinerary.duration),
          segments: itinerary.segments.map(makeFlightSegmentsArray(aircrafts, airlines, airports)),
        };

        // if (result.duration < filter.duration.min) {
        //   filter.duration.min = result.duration;
        // }
        // if (result.duration > filter.duration.max) {
        //   filter.duration.max = result.duration;
        // }

        // if (dateTimeHelper.getMinutesFromIsoString(result.segments[0].departure.at) < (!filter.departureTime.min ? Number.POSITIVE_INFINITY : dateTimeHelper.getMinutesFromIsoString(filter.departureTime.min))) {
        //   filter.departureTime.min = result.segments[0].departure.at;
        // }
        // if (dateTimeHelper.getMinutesFromIsoString(result.segments[0].departure.at) > (!filter.departureTime.max ? 0 : dateTimeHelper.getMinutesFromIsoString(filter.departureTime.max))) {
        //   filter.departureTime.max = result.segments[0].departure.at;
        // }

        // if (dateTimeHelper.getMinutesFromIsoString(result.segments[0].arrival.at) < (!filter.arrivalTime.min ? Number.POSITIVE_INFINITY : dateTimeHelper.getMinutesFromIsoString(filter.arrivalTime.min))) {
        //   filter.arrivalTime.min = result.segments[0].arrival.at;
        // }
        // if (dateTimeHelper.getMinutesFromIsoString(result.segments[0].arrival.at) > (!filter.arrivalTime.max ? 0 : dateTimeHelper.getMinutesFromIsoString(filter.arrivalTime.max))) {
        //   filter.arrivalTime.max = result.segments[0].arrival.at;
        // }

        return result;
      }),
    };

    // if (result.price < filter.price.min) {
    //   filter.price.min = result.price;
    // }
    // if (result.price > filter.price.max) {
    //   filter.price.max = result.price;
    // }

    return result;
  };
};

module.exports.searchFlights = async params => {
  let segments = makeSegmentsArray(params.segments);

  params.departureDate = new Date(params.departureDate);
  params.returnDate = params.returnDate ? new Date(params.returnDate) : "";

  const departureDate = dateTimeHelper.excludeDateFromIsoString(params.departureDate.toISOString());
  const returnDate = dateTimeHelper.excludeDateFromIsoString(params.returnDate ? params.returnDate.toISOString() : "");

  let amadeusSearchResult;
  if (!segments || (segments.length === 0)) {
    amadeusSearchResult = await amadeus.flightOffersSingleSearch(params.origin, params.destination, departureDate, returnDate, params.adults, params.children, params.infants, params.travelClass);
  } else {
    amadeusSearchResult = await amadeus.flightOffersMultiSearch(params.origin, params.destination, departureDate, returnDate, segments, params.adults, params.children, params.infants, params.travelClass);
  }

  if (!amadeusSearchResult.data) {
    return {
      flightDetails: [],
    };
  }

  const stops = amadeusSearchResult.data
    .reduce((res, cur) => [...res, ...cur.itineraries], [])
    .reduce((res, cur) => [...res, ...cur.segments], [])
    .filter(segment => !!segment.stops)
    .reduce((res, cur) => [...res, ...cur.stops], [])
    .map(stop => stop.iataCode);

  const airports = !!amadeusSearchResult.dictionaries ? await countryRepository.getAirportsByCode([...Object.keys(amadeusSearchResult.dictionaries.locations), ...stops]) : [];
  const aircrafts = !!amadeusSearchResult.dictionaries ? amadeusSearchResult.dictionaries.aircraft : [];
  const carriers = !!amadeusSearchResult.dictionaries ? amadeusSearchResult.dictionaries.carriers : [];
  const flightDetails = amadeusSearchResult.data.map(makeFlightDetailsArray(aircrafts, carriers, airports, params.travelClass));

  let origin = await countryRepository.getCityByCode(params.origin);
  let destination = await countryRepository.getCityByCode(params.destination);

  if (!origin) {
    origin = !!airports[params.origin] ? airports[params.origin].city : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    };
  }

  if (!destination) {
    destination = !!airports[params.destination] ? airports[params.destination].city : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    };

  }

  return {
    origin,
    destination,
    flightDetails,
  };
};


/**
 *  
 * @param {Object} params 
 * @param {FlightInfo} params.flightDetails
 */
module.exports.bookFlight = async params => {
  console.log(params);
};