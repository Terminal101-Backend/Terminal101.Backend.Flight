const dateTimeHelper = require("./dateTimeHelper");

/**
 * @typedef AirlineType
 * @property {String} name
 * @property {String} code
 */
/**
 * @typedef AirportType
 * @property {String} name
 * @property {String} code
 */
/**
 * @typedef RangeType
 * @property {Number} min
 * @property {Number} max
 */
/**
 * @typedef FilterType
 * @property {Number[]} stops
 * @property {AirportType[]} airports
 * @property {AirlineType[]} airlines
 * @property {String[]} aircrafts
 * @property {RangeType} price
 * @property {RangeType} departureTime
 * @property {RangeType} arrivalTime
 * @property {RangeType} duration
 */
/**
 * 
 * @param {Array} flights 
 * @returns {FilterType}
 */
module.exports.getFilterLimitsFromFlightDetailsArray = flights => {
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
  };

  flights.forEach(flight => {
    if (!filter.airlines.some(airline => airline.code === flight.owner.code)) {
      filter.airlines.push({
        code: flight.owner.code,
        name: flight.owner.name,
        description: flight.owner.description,
      });
    }

    if (flight.price.total < filter.price.min) {
      filter.price.min = flight.price.total;
    }
    if (flight.price.total > filter.price.max) {
      filter.price.max = flight.price.total;
    }

    flight.itineraries.forEach(itinerary => {
      if (!filter.stops.includes(itinerary.segments.length - 1)) {
        filter.stops.push(itinerary.segments.length - 1);
      }

      itinerary.segments.forEach(segment => {
        // if (!!segment.airline.code && !filter.airlines.some(airline => airline.code === segment.airline.code)) {
        //   filter.airlines.push({
        //     code: segment.airline.code,
        //     name: segment.airline.name,
        //   });
        // }

        if (!!segment.departure.airport.code && !filter.airports.some(airport => airport.code === segment.departure.airport.code)) {
          filter.airports.push({
            code: segment.departure.airport.code,
            name: segment.departure.airport.name,
          });
        }

        if (!!segment.arrival.airport.code && !filter.airports.some(airport => airport.code === segment.arrival.airport.code)) {
          filter.airports.push({
            code: segment.arrival.airport.code,
            name: segment.arrival.airport.name,
          });
        }

        if (!!segment.aircraft && !filter.aircrafts.includes(segment.aircraft)) {
          filter.aircrafts.push(segment.aircraft);
        }

        // if (!filter.stops.includes(segment.stops.length)) {
        //   filter.stops.push(segment.stops.length);
        // }
      });

      if (itinerary.duration < filter.duration.min) {
        filter.duration.min = itinerary.duration;
      }
      if (itinerary.duration > filter.duration.max) {
        filter.duration.max = itinerary.duration;
      }

      if (dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].departure.at) < (!filter.departureTime.min ? Number.POSITIVE_INFINITY : dateTimeHelper.getMinutesFromIsoString(filter.departureTime.min))) {
        filter.departureTime.min = itinerary.segments[0].departure.at;
      }
      if (dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].departure.at) > (!filter.departureTime.max ? 0 : dateTimeHelper.getMinutesFromIsoString(filter.departureTime.max))) {
        filter.departureTime.max = itinerary.segments[0].departure.at;
      }

      if (dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].arrival.at) < (!filter.arrivalTime.min ? Number.POSITIVE_INFINITY : dateTimeHelper.getMinutesFromIsoString(filter.arrivalTime.min))) {
        filter.arrivalTime.min = itinerary.segments[0].arrival.at;
      }
      if (dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].arrival.at) > (!filter.arrivalTime.max ? 0 : dateTimeHelper.getMinutesFromIsoString(filter.arrivalTime.max))) {
        filter.arrivalTime.max = itinerary.segments[0].arrival.at;
      }
    });
  });

  filter.departureTime.min = dateTimeHelper.getMinutesFromIsoString(filter.departureTime.min ?? 0);
  filter.departureTime.max = dateTimeHelper.getMinutesFromIsoString(filter.departureTime.max ?? 0);

  filter.arrivalTime.min = dateTimeHelper.getMinutesFromIsoString(filter.arrivalTime.min ?? 0);
  filter.arrivalTime.max = dateTimeHelper.getMinutesFromIsoString(filter.arrivalTime.max ?? 0);

  return filter;
};
