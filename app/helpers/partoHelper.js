const dateTimeHelper = require("./dateTimeHelper");
const flightHelper = require("./flightHelper");
const { parto } = require("../services");
const { flightInfoRepository, countryRepository, airlineRepository } = require("../repositories");
const { accountManagement } = require("../services");
const { EProvider } = require("../constants");

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
    duration: Math.floor((new Date(stop.DepartureDateTime) - new Date(stop.ArrivalDateTime)) / 60 / 1000),
    arrivalAt: stop.ArrivalDateTime,
    departureAt: stop.DepartureDateTime,
    airport: !!airports[stop.ArrivalAirport] ? airports[stop.ArrivalAirport].airport : {
      code: stop.ArrivalAirport,
      name: "UNKNOWN"
    },
    city: !!airports[stop.ArrivalAirport] ? airports[stop.ArrivalAirport].city : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
    country: !!airports[stop.ArrivalAirport] ? airports[stop.ArrivalAirport].country : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
  });
};

const makeFlightSegmentsArray = (aircrafts, airlines, airports) => {
  return segment => {
    let result = {
      duration: segment.JourneyDurationPerMinute,
      flightNumber: segment.FlightNumber,
      aircraft: aircrafts[segment.OperatingAirline.Equipment],
      airline: airlines[segment.MarketingAirlineCode],
      stops: (segment.TechnicalStops ?? []).map(makeSegmentStopsArray(airports)),
      departure: {
        airport: !!airports[segment.DepartureAirportLocationCode] ? airports[segment.DepartureAirportLocationCode].airport : {
          code: segment.DepartureAirportLocationCode,
          name: "UNKNOWN"
        },
        city: !!airports[segment.DepartureAirportLocationCode] ? airports[segment.DepartureAirportLocationCode].city : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        country: !!airports[segment.DepartureAirportLocationCode] ? airports[segment.DepartureAirportLocationCode].country : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        at: segment.DepartureDateTime,
      },
      arrival: {
        airport: !!airports[segment.ArrivalAirportLocationCode] ? airports[segment.ArrivalAirportLocationCode].airport : {
          code: segment.ArrivalAirportLocationCode,
          name: "UNKNOWN"
        },
        city: !!airports[segment.ArrivalAirportLocationCode] ? airports[segment.ArrivalAirportLocationCode].city : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        country: !!airports[segment.ArrivalAirportLocationCode] ? airports[segment.ArrivalAirportLocationCode].country : {
          code: "UNKNOWN",
          name: "UNKNOWN"
        },
        at: segment.ArrivalDateTime,
      },
    };

    return result;
  };
};

const makePriceObject = (flightPrice, travelerPricings) => ({
  total: parseFloat(flightPrice.TotalFare),
  grandTotal: parseFloat(flightPrice.TotalFare),
  base: parseFloat(flightPrice.BaseFare),
  fees: [{
    amount: parseFloat(flightPrice.TotalCommission),
    type: "COMMISSION",
  }],
  taxes: [{
    amount: parseFloat(flightPrice.TotalTax),
    code: "Total Tax",
  }],
  travelerPrices: travelerPricings.map(travelerPrice => {
    let travelerType;
    switch (travelerPrice.PassengerTypeQuantity.PassengerType) {
      case 1:
        travelerType = "ADULT";
        break;

      case 2:
        travelerType = "CHILD";
        break;

      case 3:
        travelerType = "INFANT";
        break;

      default:
    }

    return {
      total: parseFloat(travelerPrice.PassengerFare.TotalFare),
      base: parseFloat(travelerPrice.PassengerFare.BaseFare),
      count: travelerPrice.PassengerTypeQuantity.Quantity,
      travelerType,
      fees: [{
        amount: parseFloat(travelerPrice.PassengerFare.Commission),
        type: "COMMISSION",
      }],
      taxes: (travelerPrice.PassengerFare.Taxes ?? []).map(tax => ({
        amount: parseFloat(tax.Amount),
        code: "Tax",
      })),
    }
  }),
});

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass = "ECONOMY") => {
  return (flight, index) => {
    result = {
      code: `PRT-${index}`,
      owner: airlines[flight.ValidatingAirlineCode],
      availableSeats: Math.min(...flight.OriginDestinationOptions
        .reduce((res, cur) => [...res, ...cur.FlightSegments], [])
        .map(segment => segment.SeatsRemaining)),
      currencyCode: flight.AirItineraryPricingInfo.ItinTotalFare.Currency,
      travelClass,
      provider: EProvider.get("PARTO"),
      providerData: {
        fareSourceCode: flight.FareSourceCode,
      },
      price: makePriceObject(flight.AirItineraryPricingInfo.ItinTotalFare, flight.AirItineraryPricingInfo.PtcFareBreakdown),
      itineraries: flight.OriginDestinationOptions.map(itinerary => {
        let result = {
          duration: itinerary.JourneyDurationPerMinute,
          segments: itinerary.FlightSegments.map(makeFlightSegmentsArray(aircrafts, airlines, airports)),
        };

        return result;
      }),
    };

    return result;
  };
};

module.exports.searchFlights = async params => {
  let segments = makeSegmentsArray(params.segments);

  params.departureDate = new Date(params.departureDate);
  params.returnDate = params.returnDate ? new Date(params.returnDate) : "";

  const departureDate = dateTimeHelper.excludeDateFromIsoString(params.departureDate.toISOString());
  const returnDate = dateTimeHelper.excludeDateFromIsoString(params.returnDate ? params.returnDate.toISOString() : "");

  let partoSearchResult = await parto.airLowFareSearch(params.origin, params.destination, departureDate, returnDate, segments, params.adults, params.children, params.infants, params.travelClass);

  if (!partoSearchResult) {
    return {
      flightDetails: [],
    };
  }

  const stops = Object.keys(partoSearchResult
    .reduce((res, cur) => [...res, ...cur.OriginDestinationOptions], [])
    .reduce((res, cur) => [...res, ...cur.FlightSegments], [])
    .reduce((res, cur) => ({
      ...res,
      [cur.DepartureAirportLocationCode]: 1,
      [cur.ArrivalAirportLocationCode]: 1
    }), {}));
  // .filter(segment => !!segment.TechnicalStops && (segment.TechnicalStops.length > 0))
  // .reduce((res, cur) => [...res, ...cur.TechnicalStops], [])
  // .map(stop => stop.ArrivalAirport);

  const carriers = Object.keys(
    partoSearchResult
      .reduce((res, cur) => [...res, ...cur.OriginDestinationOptions], [])
      .reduce((res, cur) => [...res, ...cur.FlightSegments], [])
      .reduce((res, cur) => ({
        ...res,
        [cur.MarketingAirlineCode]: 1
      }), partoSearchResult.reduce((res, cur) => ({
        ...res,
        [cur.ValidatingAirlineCode]: 1
      }), {}))
  );

  const aircrafts = partoSearchResult
    .reduce((res, cur) => [...res, ...cur.OriginDestinationOptions], [])
    .reduce((res, cur) => [...res, ...cur.FlightSegments], [])
    .filter(segment => !!segment.OperatingAirline.Equipment)
    .reduce((res, cur) => ({
      ...res,
      [cur.OperatingAirline.Equipment]: cur.OperatingAirline.Equipment
    }), {});

  const airports = await countryRepository.getAirportsByCode([params.origin, params.destination, ...stops]);
  const airlines = await airlineRepository.getAirlinesByCode(carriers);
  const flightDetails = partoSearchResult.map(makeFlightDetailsArray(aircrafts, airlines, airports, params.travelClass));

  const { origin, destination } = flightHelper.getOriginDestinationCity(params.origin, params.destination, airports);

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
        birthDate: user.info.birthDate,
        gender: user.info.gender,
        // nationalId: user.info.nationalId,
        // nationality: user.info.nationality,
        firstName: user.info.firstName,
        middleName: user.info.middleName,
        lastName: user.info.lastName,
        document: {
          issuedAt: user.info.document.issuedAt,
          expirationDate: user.info.document.expirationDate,
          code: user.info.document.code,
        },
      };
    } else {
      const person = user.persons.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt));

      if (!person) {
        throw "passenger_not_found";
      }

      return {
        birthDate: person.birthDate,
        gender: person.gender,
        // nationalId: person.nationalId,
        // nationality: person.nationality,
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        document: {
          issuedAt: person.document.issuedAt,
          expirationDate: person.document.expirationDate,
          code: person.document.code,
        },
      };
    }
  });

  const flightInfo = await flightInfoRepository.findOne({ code: params.flightDetails.code });
  const flightIndex = flightInfo.flights.findIndex(flight => flight.code === params.flightDetails.flights.code);

  const { data: bookedFlight } = await parto.airBook(params.flightDetails.flights.providerData.fareSourceCode, params.contact, travelers);
  flightInfo.flights[flightIndex].providerData.bookedId = bookedFlight.UniqueId;
  await flightInfo.save();

  return { ...bookedFlight, bookedId: bookedFlight.UniqueId };
};

module.exports.cancelBookFlight = async bookedFlight => {
  return await parto.airBookCancel(bookedFlight.providerPnr);
}

module.exports.issueBookedFlight = async bookedFlight => {
  return await parto.airBookIssuing(bookedFlight.providerPnr);
}