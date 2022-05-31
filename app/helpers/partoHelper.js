const dateTimeHelper = require("./dateTimeHelper");
const {
  parto
} = require("../services");
const {
  countryRepository,
  airlineRepository
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
      availableSeats: Math.min(...flight.OriginDestinationOptions
        .reduce((res, cur) => [...res, ...cur.FlightSegments], [])
        .map(segment => segment.SeatsRemaining)),
      currencyCode: flight.AirItineraryPricingInfo.ItinTotalFare.Currency,
      travelClass,
      provider: EProvider.get("PARTO"),
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
      }), {})
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