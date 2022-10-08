const dateTimeHelper = require("./dateTimeHelper");
const flightHelper = require("./flightHelper");
const { avtra } = require("../services");
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
      provider: EProvider.get("AVTRA"),
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
  throw "prvoider_unavailable";
};

/**
 *  
 * @param {Object} params 
 * @param {FlightInfo} params.flightDetails
 */
module.exports.bookFlight = async params => {
  throw "prvoider_unavailable";
};

module.exports.cancelBookFlight = async bookedFlight => {
  throw "prvoider_unavailable";
}

module.exports.issueBookedFlight = async bookedFlight => {
  throw "prvoider_unavailable";
}