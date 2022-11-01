const dateTimeHelper = require("./dateTimeHelper");
const flightHelper = require("./flightHelper");
const { accountManagement, amadeus, amadeusSoap } = require("../services");
const { countryRepository, flightInfoRepository, airlineRepository } = require("../repositories");
const { EProvider } = require("../constants");

const makeSegmentsArray = segments => {
  segments = segments ?? [];
  if (!Array.isArray(segments)) {
    try {
      segments = segments.split(",");
    } catch (e) {
      segments = [segments];
    }
  }
  ;
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
      duration: dateTimeHelper.convertAmadeusTime(segment.flightDetail.flightDuration),
      flightNumber: segment.marketingCarrier.flightNumber,
      aircraft: aircrafts[segment.equipment.aircraftCode],
      airline: airlines[segment.marketingCarrier.airlineID],
      stops: (segment.stops ?? []).map(makeSegmentStopsArray(airports)),
      departure: {
        airport: !!airports[segment.originDestination.departure.airportCode] ? airports[segment.originDestination.departure.airportCode].airport : {
          code: segment.originDestination.departure.airportCode,
          name: "UNKNOWN"
        },
        city: !!airports[segment.originDestination.departure.airportCode] ? airports[segment.originDestination.departure.airportCode].city : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        country: !!airports[segment.originDestination.departure.airportCode] ? airports[segment.originDestination.departure.airportCode].country : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        terminal: segment.originDestination.departure.terminalName,
        at: segment.originDestination.departure.date + "T" + segment.originDestination.departure.time,
      },
      arrival: {
        airport: !!airports[segment.originDestination.arrival.airportCode] ? airports[segment.originDestination.arrival.airportCode].airport : {
          code: segment.originDestination.arrival.airportCode,
          name: "UNKNOWN"
        },
        city: !!airports[segment.originDestination.arrival.airportCode] ? !!airports[segment.originDestination.arrival.airportCode] ? airports[segment.originDestination.arrival.airportCode].city : {
          code: segment.originDestination.arrival.airportCode,
          name: "UNKNOWN"
        } : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        country: !!airports[segment.originDestination.arrival.airportCode] ? !!airports[segment.originDestination.arrival.airportCode] ? airports[segment.originDestination.arrival.airportCode].country : {
          code: segment.originDestination.arrival.airportCode,
          name: "UNKNOWN"
        } : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        terminal: segment.originDestination.arrival.terminalName,
        at: segment.originDestination.arrival.date + "T" + segment.originDestination.arrival.time,
      },
      baggage: segment.baggage
    };

    return result;
  };
};

const makePriceObject = (flightPrice, travelerPricings) => ({
  total: parseFloat(flightPrice.totalPrice),
  grandTotal: parseFloat(flightPrice.totalPrice),
  base: travelerPricings.reduce((total, travelerPrice) => total + parseFloat(travelerPrice.baseAmount * travelerPrice.numberOfUnits), 0),
  commissions: [],
  fees: [],
  taxes: [
    {
      amount: travelerPricings.reduce((total, travelerPrice) => total + parseFloat(travelerPrice.taxesAmount * travelerPrice.numberOfUnits), 0),
      code: "Tax",
    }
  ],
  travelerPrices: travelerPricings.map(travelerPrice => {
    let travelerType;
    switch (travelerPrice.passengerType) {
      case "CHD":
        travelerType = "CHILD";
        break;

      case "INF":
        // case "SEATED_INFANT":
        travelerType = "INFANT";
        break;

      case "ADT":
        // case "SENIOR":
        travelerType = "ADULT";
        break;

      default:
    }

    return {
      total: parseFloat(travelerPrice.baseAmount + travelerPrice.taxesAmount),
      base: parseFloat(travelerPrice.baseAmount),
      count: travelerPrice.numberOfUnits,
      travelerType,
      fees: [],
      taxes: {
        amount: parseFloat(travelerPrice.taxesAmount),
        code: "Tax",
      },
    }
  }),
});

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass = "ECONOMY") => {
  return (flight, index) => {
    result = {
      code: `AMD-${index}`,
      owner: airlines[flight.owner],
      availableSeats: 0,
      currencyCode: flight.price.currency,
      travelClass,
      provider: EProvider.get("AMADEUS"),
      providerData: flight,
      price: makePriceObject(flight.price, flight.price.offerPrices),
      itineraries: flight.flights.map(itinerary => {
        const segments = itinerary.flightSegments.map(makeFlightSegmentsArray(aircrafts, airlines, airports));
        const duration = segments.reduce((total, segment) => total + segment.duration, 0);
        let result = {
          duration,
          segments,
        };

        return result;
      }),
    };

    return result;
  };
};

module.exports.searchFlights_____OLD = async params => {
  let segments = flightHelper.makeSegmentsArray(params.segments);

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

module.exports.searchFlights = async params => {
  let segments = flightHelper.makeSegmentsArray(params.segments);

  params.departureDate = new Date(params.departureDate);
  params.returnDate = params.returnDate ? new Date(params.returnDate) : "";

  const departureDate = dateTimeHelper.excludeDateFromIsoString(params.departureDate.toISOString());
  const returnDate = dateTimeHelper.excludeDateFromIsoString(params.returnDate ? params.returnDate.toISOString() : "");

  let { result: amadeusSearchResult } = await amadeusSoap.searchFlight(params.origin, params.destination, departureDate, returnDate, segments, params.adults, params.children, params.infants, params.travelClass);

  if (!amadeusSearchResult?.flights) {
    return {
      flightDetails: [],
    };
  }

  // const stops = amadeusSearchResult
  //   .reduce((res, cur) => [...res, ...cur.itineraries], [])
  //   .reduce((res, cur) => [...res, ...cur.segments], [])
  //   .filter(segment => !!segment.stops)
  //   .reduce((res, cur) => [...res, ...cur.stops], [])
  //   .map(stop => stop.iataCode);

  const airportCodes = {};
  const aircraftCodes = {};
  const carrierCodes = {};

  amadeusSearchResult.flights.forEach(flight => {
    carrierCodes[flight.owner] = flight.owner;
    flight.flights.forEach(details => {
      details.flightSegments.forEach(segment => {
        airportCodes[segment.originDestination.departure.airportCode] = segment.originDestination.departure.airportCode;
        airportCodes[segment.originDestination.arrival.airportCode] = segment.originDestination.arrival.airportCode;
        carrierCodes[segment.marketingCarrier.airlineID] = segment.marketingCarrier.airlineID;
        aircraftCodes[segment.equipment.aircraftCode] = segment.equipment.aircraftCode;
      });
    });
  });

  const airports = await countryRepository.getAirportsByCode(Object.keys(airportCodes));
  const aircrafts = Object.keys(aircraftCodes);
  const carriers = await airlineRepository.getAirlinesByCode(Object.keys(carrierCodes));

  const flightDetails = amadeusSearchResult.flights.map(makeFlightDetailsArray(aircrafts, carriers, airports, params.travelClass));
  const {
    origin,
    destination
  } = await flightHelper.getOriginDestinationCity(params.origin, params.destination, airports);

  // let origin = await countryRepository.getCityByCode(params.origin);
  // let destination = await countryRepository.getCityByCode(params.destination);

  // if (!origin) {
  //   origin = !!airports[params.origin] ? airports[params.origin].city : {
  //     code: "UNKNOWN",
  //     name: "UNKNOWN"
  //   };
  // }

  // if (!destination) {
  //   destination = !!airports[params.destination] ? airports[params.destination].city : {
  //     code: "UNKNOWN",
  //     name: "UNKNOWN"
  //   };

  // }

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
  const { data: user } = await accountManagement.getUserInfo(params.userCode);

  const travelers = params.passengers.map(passenger => {
    if (!!user.info && !!user.info.document && (user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)) {
      return {
        passenger: {
          birthdate: dateTimeHelper.excludeDateFromIsoString(user.info.birthDate),
          emailContact: user.email,
          gender: user.info.gender,
          nameGiven: user.info.firstName,
          surname: user.info.lastName,
          passengerType: (user.info.type === "ADULT" ? "ADT" : (user.info.type === "CHILD" ? "CHD" : "INF")),
          // passengerType: user.info.type,
          phone: {
            areaCode: "",
            countryCode: "",
            number: (!!user.mobileNumber) ? user.mobileNumber : params.contact.mobileNumber,
          },
        },
        document: {
          expirationDate: dateTimeHelper.excludeDateFromIsoString(user.info.document.expirationDate),
        },
      };
    } else {
      const person = user.persons.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt));

      if (!person) {
        throw "passenger_not_found";
      }

      return {
        passenger: {
          birthdate: dateTimeHelper.excludeDateFromIsoString(person.birthDate),
          gender: person.gender,
          nameGiven: person.firstName,
          surname: person.lastName,
          emailContact: params.contact.email,
          passengerType: (person.type === "ADULT" ? "ADT" : (person.type === "CHILD" ? "CHD" : "INF")),
          // passengerType: person.type,
          phone: {
            areaCode: "",
            countryCode: "",
            number: params.contact.mobileNumber,
          },
        },
        document: {
          expirationDate: dateTimeHelper.excludeDateFromIsoString(person.document.expirationDate),
          documentID: person.document.code,
        },
      };
    }
  });

  // const flightInfo = await flightInfoRepository.findOne({ code: params.flightDetails.code });
  // const flightIndex = flightInfo.flights.findIndex(flight => flight.code === params.flightDetails.flights.code);

  // const bookedFlight = await amadeusSoap.bookFlight(this.regenerateAmadeusSoapBookFlightObject(params.flightDetails), travelers);
  const bookedFlight = await amadeusSoap.bookFlight(params.flightDetails.flights.providerData, travelers);
  if (!bookedFlight.succeed) {
    throw bookedFlight.errorMessage;
  }
  ;
  // flightInfo.flights[flightIndex].providerData.bookedId = bookedFlight.result.pnr;
  // flightInfo.flights[flightIndex].providerData.shoppingResponseId = bookedFlight.result.flight.shoppingResponseID;
  // await flightInfo.save();

  return { ...bookedFlight.result, bookedId: bookedFlight.result.pnr };
};

/**
 *
 * @param {String} searchCode
 * @param {Number} flightCode
 * @param {String<"flight-offers-pricing|flight-order">} type
 * @returns {Promise}
 */
module.exports.regenerateAmadeusFlightOfferObject = async (searchCode, flightCode) => {
  /**
   *
   * @param {Date} date
   * @returns {String}
   */
  const dateToIsoString = date => {
    let result = date.toISOString();
    return result.replace(/\.\d+Z$/, "");
  }

  const flightInfo = await flightInfoRepository.getFlight(searchCode, flightCode);
  let travelClass;
  switch (flightInfo.flight.travelClass) {
    case "ECONOMY":
      travelClass = "Y";
      break;

    case "PERMIUM_ECONOMY":
      travelClass = "W";
      break;

    case "BUSINESS":
      travelClass = "J";
      break;

    case "FIRST":
      travelClass = "F";
      break;

    default:
      travelClass = "T";
  }

  return {
    type: "flight-offer",
    id: "1",
    source: "GDS",
    itineraries: flightInfo.flight.itineraries.map((itinerary, itineraryIndex) => ({
      segments: itinerary.segments.map((segment, segmentIndex) => ({
        departure: {
          iataCode: segment.departure.airport.code,
          at: dateToIsoString(segment.departure.at),
        },
        arrival: {
          iataCode: segment.arrival.airport.code,
          at: dateToIsoString(segment.arrival.at),
        },
        carrierCode: segment.airline.code,
        number: segment.flightNumber,
        id: `${itineraryIndex + 1}-${segmentIndex + 1}`,
      })),
    })),
    validatingAirlineCodes: flightInfo.flight.itineraries.reduce((res, cur) => [...res, ...cur.segments.map(segment => segment.airline.code)], []),
    travelerPricings: flightInfo.flight.price.travelerPrices.map((price, travelerIndex) => ({
      travelerId: `${travelerIndex + 1}`,
      fareOption: "STANDARD",
      travelerType: price.travelerType,
      price: {
        currency: flightInfo.flight.currencyCode,
      },
      fareDetailsBySegment: flightInfo.flight.itineraries.reduce((res, cur, itineraryIndex) => [...res, ...cur.segments.map((segment, segmentIndex) => ({
        segmentId: `${itineraryIndex + 1}-${segmentIndex + 1}`,
        class: travelClass,
      }))], [])
    })),
  }
}

/**
 *
 * @param {String} searchCode
 * @param {Number} flightCode
 * @param {String<"flight-offers-pricing|flight-order">} type
 * @returns {}
 */
module.exports.regenerateAmadeusSoapBookFlightObject = flightInfo => {
  /**
   *
   * @param {Date} date
   * @returns {String}
   */
  const dateToIsoString = date => {
    let result = date.toISOString();
    return result.replace(/\.\d+Z$/, "");
  }

  // const flightInfo = await this.getFlight(searchCode, flightCode);
  let travelClass;
  switch (flightInfo.flights.travelClass) {
    case "ECONOMY":
      travelClass = "M";
      break;

    case "PERMIUM_ECONOMY":
      travelClass = "W";
      break;

    case "BUSINESS":
      travelClass = "C";
      break;

    case "FIRST":
      travelClass = "F";
      break;

    default:
      travelClass = "L";
  }

  return {
    offerID: flightInfo.flights.providerData.offerId,
    price: {
      offerPrices: flightInfo.flights.price.travelerPrices.map(price => ({
        baseAmount: 0,
        taxesAmount: 0,
        passengerType: (price.travelerType === "ADULT" ? "ADT" : (price.travelerType === "CHILD" ? "CHD" : "INF")),
        numberOfUnits: price.count,
      }))
    },
    owner: flightInfo.flights.owner.code,
    fareType: "RP",
    flights: flightInfo.flights.itineraries.map(itinerary => ({
      flightSegments: itinerary.segments.map(segment => ({
        originDestination: {
          departure: {
            airportCode: segment.departure.airport.code,
            date: dateTimeHelper.excludeDateFromIsoString(dateToIsoString(segment.departure.at)),
            time: dateTimeHelper.excludeTimeFromIsoString(dateToIsoString(segment.departure.at)),
          },
          arrival: {
            airportCode: segment.arrival.airport.code,
            date: dateTimeHelper.excludeDateFromIsoString(dateToIsoString(segment.arrival.at)),
            time: dateTimeHelper.excludeTimeFromIsoString(dateToIsoString(segment.arrival.at)),
          },
        },
        marketingCarrier: {
          airlineID: segment.airline.code,
          flightNumber: segment.flightNumber,
        },
        operatingCarrier: {
          airlineID: segment.airline.code,
        },
        flightDetail: {
          classOfService: {
            code: travelClass,
          }
        },
      })),
      departure: {
        airportCode: "",
      },
      arrival: {
        airportCode: "",
      }
    })),
  }
}

module.exports.cancelBookFlight = async bookedFlight => {
}

module.exports.issueBookedFlight = async bookedFlight => {
}

module.exports.airRevalidate = async flightInfo => {
  try {
    const flightInfoAmadeusObject = await this.regenerateAmadeusSoapBookFlightObject(flightInfo);
    let { result: airRevalidate } = await amadeusSoap.airRevalidate(flightInfoAmadeusObject);
    if (!airRevalidate) {
      return {
        error: 'Revalidation failed',
      };
    }
    return makePriceObject(airRevalidate.price, airRevalidate.price.offerPrices);

  } catch (e) {
    return e
  }
}