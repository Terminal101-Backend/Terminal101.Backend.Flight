const { EProvider, EFlightWaypoint, ETravelClass, EFeeType } = require("../constants");
const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { getIpInfo } = require("../services/ip");
const {
  providerRepository,
  countryRepository,
  airlineRepository,
  flightInfoRepository,
  flightConditionRepository,
  bookedFlightRepository,
  commissionRepository
} = require("../repositories");
// const { FlightInfo } = require("../models/documents");
const { amadeus, accountManagement } = require("../services");
const { flightHelper, amadeusHelper, partoHelper, avtraHelper, dateTimeHelper, arrayHelper, worldticketHelper, tokenHelper } = require("../helpers");
const socketClients = {};

// NOTE: Flight
// NOTE: Search origin or destination
module.exports.searchOriginDestination = async (req, res) => {
  try {
    let keyword = req.query.keyword ?? "";
    keyword = keyword.trim();
    const isKeywordEmpty = !keyword;
    let ipInfo;
    if (!keyword) {
      if (EFlightWaypoint.check("ORIGIN", req.params.waypointType)) {
        let ip = request.getRequestIpAddress(req);
        ip = ip.includes(':') ? ip.split(':')[0] : ip;

        ipInfo = await getIpInfo(ip);
        // ipInfo = await getIpInfo("5.239.149.82");
        console.log({ ip, ipInfo });
        if (ipInfo.status === "success") {
          keyword = ipInfo.city;
        }
      } else {
        response.error(res, "keyword_required", 400);
        return;
      }
    }

    let result = await countryRepository.search(keyword, 5);
    if (!!isKeywordEmpty && (result.airports.length === 0)) {
      result = await countryRepository.search(keyword.replace(/-/g, " "), 5);
    }
    if (!!isKeywordEmpty && (result.airports.length === 0)) {
      keyword = ipInfo.country;
      result = await countryRepository.search(keyword, 5)
    }
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
const getSearchFlightsByPaginate = (flightInfo, flights, page = 0, pageSize, additionalFields = {}) => {
  if (page == -1) {
    page = 0;
    pageSize = flights.length;
  }

  return {
    code: flightInfo.code,
    ...additionalFields,
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
    flights: arrayHelper.pagination(flights.map(flight => {
      const { providerData, ...fInfo } = flight;

      return fInfo;
    }).sort((flight1, flight2) => flight1.price.total - flight2.price.total), page, pageSize),
  };
};

const appendProviderResult = async (origin, destination, time, flights, searchCode) => {
  let flightInfo = await flightInfoRepository.createFlightInfo(
    origin,
    destination,
    time,
    searchCode,
  );

  // TODO: Make last search distinct
  // TODO: Update search and append only last search
  flightInfo.flights = flights;
  flightInfo.filter = flightHelper.getFilterLimitsFromFlightDetailsArray(flights);

  // if (searchCode === -1) {
  //   searchCode = flightInfo.searches.push({
  //     code: await flightInfoRepository.generateUniqueCode(),
  //     flights: flights,
  //     filter: flightHelper.getFilterLimitsFromFlightDetailsArray(flights),
  //   }) - 1;
  // } else {
  //   flightInfo.searches[searchCode].flights = flights;
  //   flightInfo.searches[searchCode].filter = flightHelper.getFilterLimitsFromFlightDetailsArray(flightInfo.searches[searchCode].flights);
  // }

  await flightInfo.save();

  return flightInfo;
};

const checkIfProviderNotRestrictedForThisRoute = (flightConditions, activeProviders) => {
  return activeProviders.filter(provider => {
    const providerIsRestricted = flightConditions.some(flightCondition => {
      const anyAirlines = !!flightCondition.airline.exclude && (!flightCondition.airline.items || (flightCondition.airline.items.length === 0));
      if (!!anyAirlines) {
        if (!!flightCondition.isRestricted && flightCondition.providerNames.includes(EProvider.find(provider.name))) {
          return true;
        }
        if (!flightCondition.isRestricted && !flightCondition.providerNames.includes(EProvider.find(provider.name))) {
          return true;
        }
        return false;
      } else {
        return false
      }
      ;
    });

    return !providerIsRestricted;
  });
};

module.exports.filterFlightDetailsByFlightConditions = (flightConditions, providerName, flightDetails) => {
  let filteredFlights = flightDetails;

  // TODO: Check commission for each condition
  // TODO: Check additional commission for business

  flightConditions.forEach(flightCondition => {
    filteredFlights = filteredFlights.filter(flight =>
      flight.itineraries.every(itinerary => {
        const first = 0, last = itinerary.segments.length - 1;
        const originCode = itinerary.segments[first].departure.airport.code;
        const destinationCode = itinerary.segments[last].arrival.airport.code;
        const airlineCode = itinerary.segments[first].airline.code;
        let found = false;

        // NOTE: Check if origin exclude is false and flight origin is in origins list
        let foundOrigin = !flightCondition.origin.exclude && flightCondition.origin.items.some(origin => origin.code === originCode);
        // NOTE: Check if origin exclude is true and flight origin is not in origins list
        foundOrigin = foundOrigin || (!!flightCondition.origin.exclude && !flightCondition.origin.items.some(origin => origin.code === originCode));

        // NOTE: Check if destination exclude is false and flight destination is in destinations list
        let foundDestination = !flightCondition.destination.exclude && flightCondition.destination.items.some(destination => destination.code === destinationCode);
        // NOTE: Check if destination exclude is true and flight destination is not in destinations list
        foundDestination = foundDestination || (!!flightCondition.destination.exclude && !flightCondition.destination.items.some(destination => destination.code === destinationCode));

        // NOTE: Check if airline exclude is false and flight airline is in airlines list
        let foundAirline = !flightCondition.airline.exclude && flightCondition.airline.items.some(airline => airline.code === airlineCode);
        // NOTE: Check if airline exclude is true and flight airline is not in airlines list
        foundAirline = foundAirline || (!!flightCondition.airline.exclude && !flightCondition.airline.items.some(airline => airline.code === airlineCode));

        if (!foundOrigin || !foundDestination || !foundAirline) {
          found = true;
        }
        if (!flightCondition.isRestricted && flightCondition.providerNames.includes(providerName)) {
          found = true;
        }
        if (!!flightCondition.isRestricted && !flightCondition.providerNames.includes(providerName)) {
          found = true;
        }

        return found;
      })
    );
  });

  return filteredFlights;
};

module.exports.addCommissionToFlightDetails = (commissions, providerName, flightDetails) => {
  commissions.forEach(commission => {
    flightDetails.forEach(flight => {
      const passConditions = flight.itineraries.every(itinerary => {
        const first = 0, last = itinerary.segments.length - 1;
        const originCode = itinerary.segments[first].departure.airport.code;
        const destinationCode = itinerary.segments[last].arrival.airport.code;
        const airlineCode = itinerary.segments[first].airline.code;
        let found = false;

        // NOTE: Check if origin exclude is false and flight origin is in origins list
        let foundOrigin = !commission.origin.exclude && commission.origin.items.some(origin => origin.code === originCode);
        // NOTE: Check if origin exclude is true and flight origin is not in origins list
        foundOrigin = foundOrigin || (!!commission.origin.exclude && !commission.origin.items.some(origin => origin.code === originCode));

        // NOTE: Check if destination exclude is false and flight destination is in destinations list
        let foundDestination = !commission.destination.exclude && commission.destination.items.some(destination => destination.code === destinationCode);
        // NOTE: Check if destination exclude is true and flight destination is not in destinations list
        foundDestination = foundDestination || (!!commission.destination.exclude && !commission.destination.items.some(destination => destination.code === destinationCode));

        // NOTE: Check if airline exclude is false and flight airline is in airlines list
        let foundAirline = !commission.airline.exclude && commission.airline.items.some(airline => airline.code === airlineCode);
        // NOTE: Check if airline exclude is true and flight airline is not in airlines list
        foundAirline = foundAirline || (!!commission.airline.exclude && !commission.airline.items.some(airline => airline.code === airlineCode));

        if (!foundOrigin || !foundDestination || !foundAirline) {
          found = true;
        }
        if (!commission.isRestricted && commission.providerNames.includes(providerName)) {
          found = true;
        }
        if (!!commission.isRestricted && !commission.providerNames.includes(providerName)) {
          found = true;
        }

        return found;
      });

      if (!!passConditions) {
        const lastBase = flight.price.base;
        flight.price.base *= 1 + commission.value.percent / 100;
        flight.price.base += commission.value.constant;
        flight.price.base = Math.round(flight.price.base * 100) / 100;

        flight.price.total += flight.price.base - lastBase;
        flight.price.grandTotal += flight.price.base - lastBase;
      }
    });
  });

  return flightDetails;
};

// NOTE: Search flights
module.exports.searchFlights = async (req, res) => {
  try {
    let decodedToken;
    if ((req?.header("BusinessMode") || "").toLowerCase() == "true") {
      try {
        decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
        if (decodedToken.type !== "BUSINESS") {
          response.error(res, "user_invalid", 400);
          return;
        }
      } catch (e) {
        console.trace(e);
        response.error(res, "access_denied", 403);
        return;
      }
    }
    let testMode = process.env.TEST_MODE;
    /**
     * @type {Promise<Array>}
     */
    let activeProviders = await providerRepository.getActiveProviders();
    if (!!decodedToken && (decodedToken.type === "BUSINESS")) {
      const { data: user } = await accountManagement.getUserInfo(decodedToken.user);
      const business = user.businesses.find(b => decodedToken.business === b.code);
      activeProviders = activeProviders.filter(provider => EProvider.check(business.thirdPartyAccount.availableProviders, provider.name));
    }

    const activeProviderCount = activeProviders.length;
    const lastSearch = [];
    let hasResult = false;
    let providerNumber = 0;
    const {
      origin,
      destination
    } = await flightHelper.getOriginDestinationCity(req.query.origin, req.query.destination);
    const flightInfo = await appendProviderResult(origin, destination, new Date(req.query.departureDate).toISOString(), []);
    const searchCode = flightInfo.code;

    if (req.method === "SOCKET") {
      response.success(res, getSearchFlightsByPaginate(flightInfo, [], req.header("Page"), req.header("PageSize"), { completed: false }));
      if (!socketClients[res.clientId]) {
        socketClients[res.clientId] = {};
      }
      socketClients[res.clientId].lastSearchFlight = flightInfo.code;
    }

    if (activeProviderCount === 0) {
      response.error(res, "provider_not_available", 404);
      return;
    }

    const flightConditions = await flightConditionRepository.findFlightCondition(req.query.origin, req.query.destination);
    // TODO: Check if user logged in as business user
    const commissions = await commissionRepository.findCommission(req.query.origin, req.query.destination, decodedToken?.business);
    const providersResultCompleted = activeProviders.reduce((res, cur) => ({
      ...res,
      [cur.title]: false,
    }), {});

    activeProviders.forEach(provider => {
      const providerHelper = eval(EProvider.find(provider.name).toLowerCase() + "Helper");

      providerHelper.searchFlights(req.query, testMode).then(async flight => {
        if (req.method === "SOCKET") {
          if (searchCode !== socketClients[res.clientId].lastSearchFlight) {
            return;
          }
        }

        const flightDetails = this.filterFlightDetailsByFlightConditions(flightConditions, EProvider.find(provider.name), flight.flightDetails);
        this.addCommissionToFlightDetails(commissions, EProvider.find(provider.name), flightDetails);

        lastSearch.push(...flightDetails);
        appendProviderResult(flight.origin, flight.destination, req.query.departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize")).catch(e => {
          console.trace(e);
        });

        hasResult = true;

        if ((req.method === "SOCKET") && (req.header("Page") === -1)) {
          providersResultCompleted[provider.title] = true;
          const completed = Object.values(providersResultCompleted).every(providerCompleted => !!providerCompleted);
          response.success(res, getSearchFlightsByPaginate(flightInfo, flightDetails, req.header("Page"), req.header("PageSize"), { completed }));
        } else if (++providerNumber === activeProviderCount) {
          response.success(res, getSearchFlightsByPaginate(flightInfo, lastSearch, req.header("Page"), req.header("PageSize")));
        }
      }).catch(e => {
        console.error(`Provider (${provider.title}) returns error: `, e);
        const completed = Object.values(providersResultCompleted).every(providerCompleted => !!providerCompleted);
        providersResultCompleted[provider.title] = true;
        if (++providerNumber === activeProviderCount) {
          if (!hasResult && (req.method === "SOCKET")) {
            response.exception(res, e);
          } else {
            response.success(res, getSearchFlightsByPaginate(flightInfo, lastSearch, req.header("Page"), req.header("PageSize"), { completed }));
          }
        }
      });
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get filters
module.exports.getFilterLimit = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getSearchByCode(req.params.searchId);

    response.success(res, {
      stops: flightInfo.filter.stops,
      aircrafts: flightInfo.filter.aircrafts,
      airports: flightInfo.filter.airports.map(airport => ({
        code: airport.code,
        name: airport.name,
        description: airport.description,
      })),
      airlines: flightInfo.filter.airlines.map(airline => ({
        code: airline.code,
        name: airline.name,
        description: airline.description,
      })),
      price: {
        min: flightInfo.filter.price.min,
        max: flightInfo.filter.price.max,
      },
      departureTime: {
        min: flightInfo.filter.departureTime.min,
        max: flightInfo.filter.departureTime.max,
      },
      arrivalTime: {
        min: flightInfo.filter.arrivalTime.min,
        max: flightInfo.filter.arrivalTime.max,
      },
      duration: {
        min: flightInfo.filter.duration.min,
        max: flightInfo.filter.duration.max,
      },
    });
  } catch (e) {
    response.exception(res, e);
  }
}

// NOTE: Filter flights
module.exports.filterFlights = async (req, res) => {
  try {
    const flightInfo = await flightInfoRepository.getSearchByCode(req.params.searchId);

    const now = new Date();

    if (now - flightInfo.searchedTime > process.env.SEARCH_TIMEOUT * 60 * 1000) {
      throw "search_expired";
    }

    const flights = flightInfo.flights.map(flight => {
      let itineraries = [];
      if ((!req.query.priceFrom || (flight.price >= req.query.priceFrom)) && (!req.query.priceTo || (flight.price <= req.query.priceTo))) {
        itineraries = flight.itineraries.map(itinerary => ({
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
              country: {
                code: segment.departure.country.code,
                name: segment.departure.country.name,
                description: segment.departure.country.description,
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
              country: {
                code: segment.arrival.country.code,
                name: segment.arrival.country.name,
                description: segment.arrival.country.description,
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
              country: {
                code: stop.country.code,
                name: stop.country.name,
                description: stop.country.description,
              },
            })),
          })),
        })).filter(itinerary => {
          let result = true;

          let segments = itinerary.segments.some(segment => {
            let result = true;
            let airlines = req.query.airlines;
            let airports = req.query.airports;
            let stops = req.query.stops

            if (!!stops && (typeof stops === "string")) {
              stops = stops.split(",").map(stop => parseInt(stop.trim()));
            }

            if (!!airlines && (typeof airlines === "string")) {
              airlines = airlines.split(",").map(airline => airline.trim());
            }

            if (!!airports && (typeof airports === "string")) {
              airports = airports.split(",").map(airport => airport.trim());
            }

            result = result && (!stops || stops.includes(segment.stops.length));

            result = result && (!airlines || airlines.includes(segment.airline.code));

            result = result && (!airports || airports.includes(segment.departure.airport.code) || airports.includes(segment.arrival.airport.code));

            return result;
          });

          if (!segments) {
            return false;
          }

          const departureTime = dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].departure.at);

          result = result && (!req.query.departureTimeFrom || (departureTime >= req.query.departureTimeFrom));
          result = result && (!req.query.departureTimeTo || (departureTime <= req.query.departureTimeTo));

          const arrivalTime = dateTimeHelper.getMinutesFromIsoString(itinerary.segments[0].arrival.at);

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
        price: {
          total: flight.price.total,
          grandTotal: flight.price.grandTotal,
          base: flight.price.base,
          travelerPrices: flight.price.travelerPrices.map(travelerPrice => ({
            total: travelerPrice.total,
            base: travelerPrice.base,
            fees: travelerPrice.fees.map(fee => ({
              amount: fee.amount,
              type: EFeeType.find(fee.type),
            })),
            taxes: travelerPrice.taxes.map(tax => ({
              amount: tax.amount,
              code: tax.code,
            })),
          })),
          fees: flight.price.fees.map(fee => ({
            amount: fee.amount,
            type: EFeeType.find(fee.type),
          })),
          taxes: flight.price.taxes.map(tax => ({
            amount: tax.amount,
            code: tax.code,
          })),
        },
        itineraries,
      };
    }).filter(flight => flight.itineraries.length > 0);

    response.success(res, {
      code: flightInfo.code,
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
      flights: arrayHelper.pagination(flights, req.header("Page"), req.header("PageSize")),
      // flights,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific flight's price
module.exports.getFlightPrice = async (req, res) => {
  try {
    const amadeusFlightObject = await amadeusHelper.regenerateAmadeusFlightOfferObject(req.params.searchId, req.params.flightCode);

    const result = await amadeus.updateFlightPrice(amadeusFlightObject);

    if (!!result.data && !!result.data.flightOffers && (result.data.flightOffers.length > 0)) {
      const price = makePriceObject(result.data.flightOffers[0].price, result.data.flightOffers[0].travelerPricings);

      response.success(res, price);
    } else {
      response.success(res, {});
    }
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific flight
module.exports.getFlight = async (req, res) => {
  try {
    let flightInfo = await flightInfoRepository.getFlight(req.params.searchId, req.params.flightCode);

    if (!flightInfo) {
      response.error(res, "flight_not_found", 404);
      return;
    }
    const isBookedFlight = await bookedFlightRepository.findOne({
      searchedFlightCode: req.params.searchId,
      flightDetailsCode: req.params.flightCode
    });
    if (!isBookedFlight) {
      const providerName = flightInfo.flights.provider.toLowerCase();
      const providerHelper = eval(providerName + "Helper");
      const newPrice = await providerHelper.airRevalidate(flightInfo);

      // if(!newPrice){
      //   console.log('err :', newPrice)
      //   response.exception(res, 'This Flight Not Available, Please try booking another flight.')
      // }
      if (!!newPrice.error) {
        response.exception(res, newPrice.error);
        return;
      }
      let oldPrice = flightInfo.flights.price.total;

      let priceChange = (oldPrice - newPrice.total !== 0) ? true : false;
      if (!!priceChange) {
        await flightInfoRepository.updateFlightDetails(req.params.searchId, req.params.flightCode, newPrice);
        flightInfo = await flightInfoRepository.getFlight(req.params.searchId, req.params.flightCode);
      }
    }

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
        code: flightInfo.flights.code,
        availableSeats: flightInfo.flights.availableSeats,
        currencyCode: flightInfo.flights.currencyCode,
        fare: flightInfo.flights.providerData.fare,
        // price: flightInfo.flights.price,
        price: {
          total: flightInfo.flights.price.total,
          grandTotal: flightInfo.flights.price.grandTotal,
          base: flightInfo.flights.price.base,
          travelerPrices: flightInfo.flights.price.travelerPrices.map(travelerPrice => ({
            type: travelerPrice.travelerType,
            total: travelerPrice.total,
            base: travelerPrice.base,
            count: travelerPrice.count,
            fees: travelerPrice.fees.map(fee => ({
              amount: fee.amount,
              type: EFeeType.find(fee.type),
            })),
            taxes: travelerPrice.taxes.map(tax => ({
              amount: tax.amount,
              code: tax.code,
            })),
          })),
          fees: flightInfo.flights.price.fees.map(fee => ({
            amount: fee.amount,
            type: EFeeType.find(fee.type),
          })),
          taxes: flightInfo.flights.price.taxes.map(tax => ({
            amount: tax.amount,
            code: tax.code,
          })),
        },
        itineraries: flightInfo.flights.itineraries.map(itinerary => ({
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
              country: {
                code: segment.departure.country.code,
                name: segment.departure.country.name,
                description: segment.departure.country.description,
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
                description: segment.arrival.country.description,
              },
              country: {
                code: segment.arrival.country.code,
                name: segment.arrival.country.name,
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
              country: {
                code: stop.country.code,
                name: stop.country.name,
                description: stop.country.description,
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
    const countries = await countryRepository.findMany({}, "name");
    response.success(res, countries.map(country => ({
      code: country.code,
      name: country.name,
      dialingCode: country.dialingCode
    })));
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

// NOTE: Get airlines
module.exports.getAirlines = async (req, res) => {
  try {
    const airline = await airlineRepository.findMany();

    response.success(res, airline.map(airline => ({
      code: airline.code,
      name: airline.name,
      description: airline.description
    })));
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

module.exports.flightCreateOrder = async (req, res) => {
  try {
    const report = await amadeus.flightCreateOrder(req.body);

    response.success(res, report);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Flight
// NOTE: Search origin or destination by Amadeus
module.exports.searchOriginDestinationAmadeus = async (req, res) => {
  try {
    let keyword = req.query.keyword ?? "";
    const isKeywordEmpty = !keyword;
    let ipInfo;
    if (!keyword) {
      if (EFlightWaypoint.check("ORIGIN", req.params.waypointType)) {
        let ip = request.getRequestIpAddress(req);
        ip = ip.includes(':') ? ip.split(':')[0] : ip;

        ipInfo = await getIpInfo(ip);
        // ipInfo = await getIpInfo("5.239.149.82");
        // ipInfo = await getIpInfo("161.185.160.93");
        console.log({ ip, ipInfo });
        // if (ipInfo.status === "success") {
        //   keyword = ipInfo.countryCode;
        // }
        // if (ipInfo.status === "success") {
        //   keyword = ipInfo.city;
        // }
        const { data: result } = await amadeus.searchAirportAndCityNearestWithAccessToken(ipInfo.lat, ipInfo.lon);
        const { data: resultTransformed } = transformDataAmadeus(result);
        response.success(res, resultTransformed);
      } else {
        response.error(res, "keyword_required", 400);
        return;
      }
    } else {
      const { data: result } = await amadeus.searchAirportAndCityWithAccessToken(keyword);
      const { data: resultTransformed } = transformDataAmadeus(result);
      response.success(res, resultTransformed);
    }
  } catch (e) {
    response.exception(res, e);
  }


};

//Internal Function
function transformDataAmadeus(data) {
  const newData = [];

  data.forEach(element => {
    newData.push({
      subType: element.subType,
      name: toCamelCase(element.name),
      code: element.iataCode,
      geoCode: element.geoCode,
      address: element.address
    })
  });


  return {
    data: newData
  };
}

function toCamelCase(input) {
  var result = input.toLowerCase().replace(/\s+(\w)?/gi,
    (match, letter) => {
      return letter.toUpperCase()
    }).replace(/([A-Z])/g, " $1");

  return result.charAt(0).toUpperCase() + result.slice(1);
}

