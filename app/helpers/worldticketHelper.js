const dateTimeHelper = require("./dateTimeHelper");
const flightHelper = require("./flightHelper");
const worldticket = require("../services/worldticket");
const { flightInfoRepository, countryRepository, airlineRepository } = require("../repositories");
const { accountManagement } = require("../services");
const { EProvider } = require("../constants");


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
  duration: Math.floor((new Date(segment.ArrivalDateTime) - new Date(segment.DepartureDateTime)) / 60 / 1000),
  flightNumber: segment.FlightNumber,
  aircraft: aircrafts[segment.TPA_Extensions.Equipment.AirEquipType],
  airline: airlines[segment.OperatingAirline.Code.length === 2 ? segment.OperatingAirline.Code : segment.OperatingAirline.Code[0] + segment.OperatingAirline.Code[2]],
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
  fees: flightPrice.Fees ? Array.isArray(flightPrice.Fees) ? flightPrice.Fees : [flightPrice.Fees.Fee].map(fee => ({
    amount: fee.Amount,
    type: "SUPPLIER"
  })) : [],
  taxes: Array.isArray(travelerPricings) ? travelerPricings : [travelerPricings.PTC_FareBreakdown].reduce((res, cur) => {
    const result = res;
    cur.PassengerFare.Taxes ?
      cur.PassengerFare.Taxes.Tax.forEach(tax => {
        const taxIndex = result.findIndex(t => t.code === tax.TaxCode);

        if (taxIndex >= 0) {
          result[taxIndex].amount += tax.Amount;
        } else {
          result.push({
            amount: parseFloat(tax.Amount),
            code: tax.TaxCode,
          });
        }
      }) : [];

    return result;
  }, []),
  travelerPrices: Array.isArray(travelerPricings) ? travelerPricings : [travelerPricings.PTC_FareBreakdown].map(travelerPrice => {
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
      fees: flightPrice.Fees ? Array.isArray(flightPrice.Fees) ? flightPrice.Fees : [flightPrice.Fees.Fee].map(fee => ({
        amount: fee.Amount,
        type: "SUPPLIER"
      })) : [],
      taxes: travelerPrice.PassengerFare.Taxes ? travelerPrice.PassengerFare.Taxes.Tax.map(tax => ({
        amount: parseFloat(tax.Amount),
        code: tax.TaxCode,
      })) : [],
    };
  }),
});

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass = "ECONOMY") => {
  return (flight, index) => {
    let code = flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline.Code.length === 2 ? flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline.Code : flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline.Code[0] + flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline.Code[2];
    result = {
      code: `WDT-${index}`,
      owner: airlines[code],
      availableSeats: flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail.ResBookDesigQuantity,
      currencyCode: flight.AirItineraryPricingInfo.ItinTotalFare.BaseFare.CurrencyCode,
      travelClass,
      provider: EProvider.get("WORLDTICKET"),
      providerData: {
        FareBasis: flight.AirItineraryPricingInfo.FareInfos.FareInfo.FareReference.$t,
        Status: Array.isArray(flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption) ? flight.AirItinerary.OriginDestinationOptions[0].OriginDestinationOption.FlightSegment.Status : flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Status,
        resBookCode: Array.isArray(flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption) ? flight.AirItinerary.OriginDestinationOptions[0].OriginDestinationOption.FlightSegment.ResBookDesigCode : flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ResBookDesigCode,
        codeAirline: flight.AirItineraryPricingInfo.FareInfos.FareInfo.FilingAirline?.$t
      },
      // price: makePriceObject(flight.AirItineraryPricingInfo.ItinTotalFare),
      itineraries: Array.isArray(flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption) ?
        flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption : [flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption]
          .map(itinerary => ({
            duration: Math.floor((new Date(itinerary.FlightSegment.ArrivalDateTime) - new Date(itinerary.FlightSegment.DepartureDateTime)) / 60 / 1000),
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
  let { data: worldticketSearchResult } = await worldticket.airLowFareSearch(params.origin, params.destination, departureDate, returnDate, segments, params.adults, params.children, params.infants, params.travelClass);

  if (!worldticketSearchResult || !!worldticketSearchResult.error) {
    return {
      flightDetails: [],
    };
  }

  const stops = Object.keys(
    worldticketSearchResult
      .reduce((res, cur) => [...res, cur.AirItinerary.OriginDestinationOptions.OriginDestinationOption], [])
      .reduce((res, cur) => ({
        ...res,
        [cur.FlightSegment.DepartureAirport.LocationCode]: 1,
        [cur.FlightSegment.ArrivalAirport.LocationCode]: 1,
      }), {})
  );

  const carriers = Object.keys(worldticketSearchResult
    .reduce((res, cur) => [...res, cur.AirItinerary.OriginDestinationOptions.OriginDestinationOption], [])
    .reduce((res, cur) => ({
      ...res,
      [cur.FlightSegment.OperatingAirline.Code.length === 2 ? cur.FlightSegment.OperatingAirline.Code : cur.FlightSegment.OperatingAirline.Code[0] + cur.FlightSegment.OperatingAirline.Code[2]]: 1,
    }), {})
  );

  const aircrafts = worldticketSearchResult.reduce((res, cur) => [...res, cur.AirItinerary.OriginDestinationOptions.OriginDestinationOption], [])
    .reduce((res, cur) => ({
      ...res,
      [cur.FlightSegment.TPA_Extensions.Equipment.AirEquipType]: cur.FlightSegment.TPA_Extensions.Equipment.AirEquipType,
    }), {});

  const airports = await countryRepository.getAirportsByCode([params.origin, params.destination, ...stops]);
  const airlines = await airlineRepository.getAirlinesByCode(carriers);
  const flightDetails = worldticketSearchResult.map(makeFlightDetailsArray(aircrafts, airlines, airports, params.travelClass));

  const { origin, destination } = await flightHelper.getOriginDestinationCity(params.origin, params.destination, airports);

  for (flight of flightDetails) {
    let { data: info } = await worldticket.airPrice(flight, params.adults, params.children, params.infants);
    flight['price'] = makePriceObject(info.AirItineraryPricingInfo.ItinTotalFare, info.AirItineraryPricingInfo.PTC_FareBreakdowns);
    flight.providerData['FareRule'] = info.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.TPA_Extensions.FareRule.$t.replace(/[\r\n]/gm, '')
  };
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

  const segments = params.flightDetails.flights.itineraries.map(itinerary => {
    const segment = itinerary.segments[0];

    return {
      date: new Date(segment.departure.at).toISOString().replace(/Z.*$/, ""),
      originCode: segment.departure.airport.code,
      destinationCode: segment.arrival.airport.code,
      airlineCode: params.flightDetails.flights.providerData.codeAirline,
      flightNumber: segment.flightNumber,
      travelClass: params.flightDetails.flights.providerData.resBookCode,
      status: params.flightDetails.flights.providerData.Status
    }
  });

  const price = {
    total: params.flightDetails.flights.price.total,
    base: params.flightDetails.flights.price.base,
    currency: params.flightDetails.flights.currencyCode,
  };

  const { data: bookedFlight } = await worldticket.book(segments, price, params.contact, travelers);
  console.log(bookedFlight)
  if (!bookedFlight.error) {
    flightInfo.flights[flightIndex].providerData.bookedId = bookedFlight;
    await flightInfo.save();

    return { ...bookedFlight, bookedId: bookedFlight.BookingReferenceID.ID };
  }
};

module.exports.cancelBookFlight = async bookedFlight => {
  throw "prvoider_unavailable";
}

module.exports.issueBookedFlight = async bookedFlight => {
  throw "prvoider_unavailable";
}

module.exports.airReValidate = async flightInfo => {
  return flightInfo.flights.price;
}