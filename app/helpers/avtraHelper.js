const dateTimeHelper = require("./dateTimeHelper");
const flightHelper = require("./flightHelper");
const {avtra} = require("../services");
const {flightInfoRepository, countryRepository, airlineRepository} = require("../repositories");
const {accountManagement} = require("../services");
const {EProvider} = require("../constants");

const regenerateBookSegment = segments => {
  return segments.map(segment => ({
    originCode,
    destinationCode,
    flightNumber,
    airlineCode,
    date,
  }))
};

const makeSegmentsArray = segments => {
  segments = segments ?? [];
  if (!Array.isArray(segments)) {
    try {
      segments = segments.split(",");
    } catch (e) {
      segments = [segments];
    }
  }

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

const makeFlightSegmentsArray = (aircrafts, airlines, airports) => segment => ({
  duration: dateTimeHelper.convertAvtraTimeToMinutes(segment.Duration),
  flightNumber: segment.FlightNumber,
  aircraft: aircrafts[segment.Equipment.AirEquipType],
  airline: airlines[segment.OperatingAirline.Code],
  stops: [],
  departure: {
    airport: !!airports[segment.DepartureAirport.LocationCode] ? airports[segment.DepartureAirport.LocationCode].airport : {
      code: segment.DepartureAirport.LocationCode,
      name: "UNKNOWN"
    },
    city: !!airports[segment.DepartureAirport.LocationCode] ? airports[segment.DepartureAirport.LocationCode].city : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
    country: !!airports[segment.DepartureAirport.LocationCode] ? airports[segment.DepartureAirport.LocationCode].country : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
    at: segment.DepartureDateTime,
  },
  arrival: {
    airport: !!airports[segment.ArrivalAirport.LocationCode] ? airports[segment.ArrivalAirport.LocationCode].airport : {
      code: segment.ArrivalAirport.LocationCode,
      name: "UNKNOWN"
    },
    city: !!airports[segment.ArrivalAirport.LocationCode] ? airports[segment.ArrivalAirport.LocationCode].city : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
    country: !!airports[segment.ArrivalAirport.LocationCode] ? airports[segment.ArrivalAirport.LocationCode].country : {
      code: "UNKNOWN",
      name: "UNKNOWN"
    },
    at: segment.ArrivalDateTime,
  },
});

const makePriceObject = (flightPrice, travelerPricings) => ({
  total: parseFloat(flightPrice.TotalFare.Amount),
  grandTotal: parseFloat(flightPrice.TotalFare.Amount),
  base: parseFloat(flightPrice.BaseFare.Amount),
  fees: [],
  taxes: travelerPricings.reduce((res, cur) => {
    const result = res;
    cur.PassengerFare.Taxes.Tax.forEach(tax => {
      const taxIndex = result.findIndex(t => t.code === tax.TaxCode);

      if (taxIndex >= 0) {
        result[taxIndex].amount += tax.$t;
      } else {
        result.push({
          amount: parseFloat(tax.$t),
          code: tax.TaxCode,
        });
      }
    });

    return result;
  }, []),
  travelerPrices: travelerPricings.map(travelerPrice => {
    let travelerType;
    switch (travelerPrice.PassengerTypeQuantity.Code) {
      case "ADT":
        travelerType = "ADULT";
        break;

      case "CHD":
        travelerType = "CHILD";
        break;

      case "INF":
        travelerType = "INFANT";
        break;

      default:
    }

    return {
      total: parseFloat(travelerPrice.PassengerFare.TotalFare.Amount),
      base: parseFloat(travelerPrice.PassengerFare.BaseFare.Amount),
      count: travelerPrice.PassengerTypeQuantity.Quantity,
      travelerType,
      fees: [],
      taxes: travelerPrice.PassengerFare.Taxes.Tax.map(tax => ({
        amount: parseFloat(tax.$t),
        code: tax.TaxCode,
      })),
    };
  }),
});

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass = "ECONOMY") => {
  return (flight, index) => {
    result = {
      code: `AVT-${index}`,
      owner: airlines[flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment.OperatingAirline.Code],
      availableSeats: Math.min(...flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption
        .reduce((res, cur) => [...res, ...cur.FlightSegment.BookingClassAvails.BookingClassAvail], [])
        .map(value => value.ResBookDesigQuantity)),
      currencyCode: flight.AirItineraryPricingInfo.ItinTotalFare.BaseFare.CurrencyCode,
      travelClass,
      provider: EProvider.get("AVTRA"),
      providerData: {
        fareSourceCode: flight,
      },
      price: makePriceObject(flight.AirItineraryPricingInfo.ItinTotalFare, flight.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown),
      itineraries: flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.map(itinerary => ({
        duration: dateTimeHelper.convertAvtraTimeToMinutes(itinerary.FlightSegment.Duration),
        segments: [itinerary.FlightSegment].map(makeFlightSegmentsArray(aircrafts, airlines, airports)),
      })),
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

  let {data: avtraSearchResult} = await avtra.lowFareSearch(params.origin, params.destination, departureDate, returnDate, segments, params.adults, params.children, params.infants, params.travelClass);

  if (!avtraSearchResult) {
    return {
      flightDetails: [],
    };
  }


  const stops = Object.keys(
    avtraSearchResult
      .reduce((res, cur) => [...res, ...cur.AirItinerary.OriginDestinationOptions.OriginDestinationOption], [])
      .reduce((res, cur) => ({
        ...res,
        [cur.FlightSegment.DepartureAirport.LocationCode]: 1,
        [cur.FlightSegment.ArrivalAirport.LocationCode]: 1,
      }), {})
  );

  const carriers = Object.keys(
    avtraSearchResult
      .reduce((res, cur) => [...res, ...cur.AirItinerary.OriginDestinationOptions.OriginDestinationOption], [])
      .reduce((res, cur) => ({
        ...res,
        [cur.FlightSegment.OperatingAirline.Code]: 1,
      }), {})
  );

  const aircrafts = avtraSearchResult
    .reduce((res, cur) => [...res, ...cur.AirItinerary.OriginDestinationOptions.OriginDestinationOption], [])
    .reduce((res, cur) => ({
      ...res,
      [cur.FlightSegment.Equipment.AirEquipType]: cur.FlightSegment.Equipment.AirEquipType,
    }), {});

  const airports = await countryRepository.getAirportsByCode([params.origin, params.destination, ...stops]);
  const airlines = await airlineRepository.getAirlinesByCode(carriers);
  const flightDetails = avtraSearchResult.map(makeFlightDetailsArray(aircrafts, airlines, airports, params.travelClass));

  const {
    origin,
    destination
  } = await flightHelper.getOriginDestinationCity(params.origin, params.destination, airports);

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
  const {data: user} = await accountManagement.getUserInfo(params.userCode);

  const travelers = params.passengers.map(passenger => {
    if (!!user.info && !!user.info.document && (user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)) {
      return {
        birthDate: new Date(user.info.birthDate).toISOString().replace(/Z.*$/, ""),
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
        birthDate: new Date(person.birthDate).toISOString().replace(/Z.*$/, ""),
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

  const flightInfo = await flightInfoRepository.findOne({code: params.flightDetails.code});
  const flightIndex = flightInfo.flights.findIndex(flight => flight.code === params.flightDetails.flights.code);

  const segments = params.flightDetails.flights.itineraries.map(itinerary => {
    const segment = itinerary.segments[0];

    return {
      date: new Date(segment.departure.at).toISOString().replace(/Z.*$/, ""),
      originCode: segment.departure.airport.code,
      destinationCode: segment.arrival.airport.code,
      airlineCode: segment.airline.code,
      flightNumber: segment.flightNumber,
    }
  });

  const price = {
    total: params.flightDetails.flights.price.total,
    base: params.flightDetails.flights.price.base,
    currency: params.flightDetails.flights.currencyCode,
  };

  const {data: bookedFlight} = await avtra.book(segments, price, params.contact, travelers);
  flightInfo.flights[flightIndex].providerData.bookedId = bookedFlight.UniqueId;
  await flightInfo.save();

  return {...bookedFlight, bookedId: bookedFlight.UniqueId};
};

module.exports.cancelBookFlight = async bookedFlight => {
  throw "prvoider_unavailable";
};

module.exports.issueBookedFlight = async bookedFlight => {
  throw "prvoider_unavailable";
};

module.exports.airRevalidate = async flightInfo => {
  return flightInfo.flights.price;
};
