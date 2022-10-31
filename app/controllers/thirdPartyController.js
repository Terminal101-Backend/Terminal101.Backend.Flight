const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { providerRepository, flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { EBookedFlightStatus, EProvider, EUserType } = require("../constants");
const { amadeus, parto, avtra, accountManagement, wallet } = require("../services");
const { tokenHelper, avtraHelper, worldticketHelper, partoHelper, amadeusHelper, flightHelper, arrayHelper } = require("../helpers");
const providerHelpers = {
  AVTRA: avtraHelper,
  WORLDTICKET: worldticketHelper,
  AMADEUS: amadeusHelper,
  PARTO: partoHelper,
}

// NOTE: Search flights by provider owner
module.exports.lowFareSearch = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";
    let hasResult = false;

    if (decodedToken?.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    let timestamp = new Date().toISOString();

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    const completedProviders = availableProviders.reduce((res, cur) => ({ ...res, [cur]: false }), {});
    const lastSearch = [];
    const providerCount = availableProviders.length;

    if (providerCount === 0) {
      response.error(res, "provider_not_found", 404);
      return;
    }
    const {
      origin,
      destination
    } = await flightHelper.getOriginDestinationCity(req.query.origin, req.query.destination);
    const flightInfo = await appendProviderResult(origin, destination, new Date(req.query.departureDate).toISOString(), []);
    const searchCode = flightInfo.code;
    availableProviders.forEach(provider => {
      providerHelpers[provider].searchFlights(req.query, testMode).then(flight => {
        hasResult = true;
        completedProviders[provider] = true;

        if (!!flight?.flightDetails && Array.isArray(flight.flightDetails)) {
          lastSearch.push(...flight.flightDetails);
          appendProviderResult(flight.origin, flight.destination, req.query.departureDate.toISOString(), lastSearch, searchCode, decodedToken.type, testMode, req.header("Page"), req.header("PageSize"));
        }

        if (Object.entries(completedProviders).every(([p, c]) => !!c)) {
          response.success(res, {
            timestamp,
            searchResult: getSearchFlightsByPaginate(flightInfo, lastSearch, req.header("Page"), req.header("PageSize"))
          });
        }
      }).catch(e => {
        completedProviders[provider] = true;
        console.trace(e);
        if (Object.entries(completedProviders).every(([p, c]) => !!c)) {
          if (!!hasResult) {
            response.success(res, {
              timestamp,
              searchResult: getSearchFlightsByPaginate(flightInfo, lastSearch, req.header("Page"), req.header("PageSize"))
            });
          } else {
            response.error(res, e.error, 400)
          }
        }
      });
    });
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
};

// NOTE: Book flight by provider
module.exports.book = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    let timestamp = new Date().toISOString();

    let flightDetails = await flightInfoRepository.getFlight(req.body.searchedFlightCode, req.body.flightDetailsCode);

    if (!flightDetails) {
      response.error(res, "flight_not_found", 404);
      return;
    }

    if (!req.body.passengers || (req.body.passengers.length === 0)) {
      response.error(res, "passenger_not_found", 404);
      return;
    }

    const { data: user } = await accountManagement.getUserInfo(decodedToken.owner);
    const existsBookedFlight = await bookedFlightRepository.findOne({
      bookedBy: decodedToken.owner,
      searchedFlightCode: req.body.searchedFlightCode,
      flightDetailsCode: req.body.flightDetailsCode
    });

    if (!!existsBookedFlight && !EBookedFlightStatus.check(["CANCEL", "REJECTED"], existsBookedFlight.statuses[existsBookedFlight.statuses.length - 1].status)) {
      response.error(res, "booked_flight_duplicated", 406);
      return;
    }
    const providerName = flightDetails.flights.provider;

    const bookedFlightSegments = [flightDetails.flights?.itineraries?.[0].segments?.[0]];
    const lastIndex = (flightDetails.flights?.itineraries?.[0].segments?.length ?? 0) - 1;
    if (lastIndex > 0) {
      bookedFlightSegments.push(flightDetails.flights?.itineraries?.[0].segments[lastIndex]);
    }

    await accountManagement.addEditPersons(decodedToken.owner, req.body.passengers);

    let passengers = req.body.passengers.map(passenger => ({
      documentCode: passenger.document.code,
      documentIssuedAt: passenger.document.issuedAt
    }));

    const providerBookResult = await providerHelpers[providerName].bookFlight({
      flightDetails,
      userCode: decodedToken.owner,
      contact: req.body.contact,
      passengers,
    }, testMode);

    let userWallet;
    userWallet = await wallet.getUserWallet(decodedToken.owner);
    if (!testMode && flightInfo.flights.price.total >= userWallet.credit) {
      response.error(res, 'Your credit is not enough for booking, Please recharge and try again.', 406);
      return;
    }

    let bookedFlight = await bookedFlightRepository.createBookedFlight(decodedToken.owner, flightDetails.flights.provider, req.body.searchedFlightCode, req.body.flightDetailsCode, providerBookResult.bookedId, userWallet?.externalTransactionId, req.body.contact, passengers, bookedFlightSegments, flightDetails.flights?.travelClass, "RESERVED");
    const flightInfo = await flightInfoRepository.getFlight(bookedFlight.searchedFlightCode, bookedFlight.flightDetailsCode);

    bookedFlight.statuses.push({
      status: EBookedFlightStatus.get("PAYING"),
      description: 'Payment is in progress',
      changedBy: "SERVICE",
    });
    //NOTE: Set Timer on Timeout
    bookedFlight.providerTimeout = providerBookResult.timeout;
    let timeout = providerBookResult.timeout - new Date().getTime();
    setTimeout(paymentTimeout, timeout, {code: bookedFlight.code, mode: testMode});
    if (!testMode) {
      if (userWallet.credit >= flightInfo.flights.price.total) {
        await wallet.addAndConfirmUserTransaction(bookedFlight.bookedBy, -flightInfo.flights.price.total, "Book flight; code: " + bookedFlight.code + (!!bookedFlight.transactionId ? "; transaction id: " + bookedFlight.transactionId : ""));
        bookedFlight.statuses.push({
          status: EBookedFlightStatus.get("PAID"),
          description: 'Payment is done.',
          changedBy: "SERVICE",
        });

        bookedFlight.statuses.push({
          status: EBookedFlightStatus.get("INPROGRESS"),
          description: "Wait for booking by backoffice.",
          changedBy: bookedFlight.bookedBy,
        });
      }
    } else {
      bookedFlight.statuses.push({
        status: EBookedFlightStatus.get("BOOK"),
        description: '--- Test API ---',
        changedBy: "SERVICE",
      });
    }
    await bookedFlight.save();
    bookedFlight = await bookedFlightRepository.getBookedFlight(decodedToken.owner, bookedFlight.code);

    response.success(res, {
      timestamp,
      bookedInfo: {
        code: bookedFlight.code,
        searchedFlightCode: bookedFlight.searchedFlightCode,
        flightDetailsCode: bookedFlight.flightDetailsCode,
        status: bookedFlight.statuses.filter((status => status.status !== 'ERROR')).pop()?.status,
        time: bookedFlight.time,
        origin: {
          code: bookedFlight.flightInfo.origin.code,
          name: bookedFlight.flightInfo.origin.name,
        },
        destination: {
          code: bookedFlight.flightInfo.destination.code,
          name: bookedFlight.flightInfo.destination.name,
        },
        travelClass: bookedFlight.flightInfo.travelClass,
        price: bookedFlight.flightInfo.flights.price.total,
        currencyCode: bookedFlight.flightInfo.flights.currencyCode,
        contact: {
          email: bookedFlight.contact.email,
          mobileNumber: bookedFlight.contact.mobileNumber,
        },
        passengers: bookedFlight.passengers.map(passenger => {
          const person = user.persons.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt)) ?? user.info
          return {
            type: person.type,
            gender: person.gender,
            firstName: person.firstName,
            lastName: person.lastName,
            middleName: person.middleName,
            nickName: person.nickName,
            birthDate: person.birthDate,
            type: person.type,
            document: {
              type: person.document.type,
              code: person.document.code,
              issuedAt: person.document.issuedAt,
              expirationDate: person.document.expirationDate,
              postCode: person.document.postCode,
            }
          };
        }),
        ticketTimeLimit: new Date(providerBookResult.timeout),
      }
    });
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
};

// NOTE: Get booked flight
module.exports.readBook = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    let timestamp = new Date().toISOString();

    const bookedFlight = await bookedFlightRepository.getBookedFlight(decodedToken.owner, req.params.bookedId);
    if (!bookedFlight) {
      response.error(res, "booked flight not found", 404);
      return;
    }

    const { data: user } = await accountManagement.getUserInfo(bookedFlight.bookedBy);

    response.success(res, {
      timestamp,
      bookedInfo: {
        code: bookedFlight.code,
        searchedFlightCode: bookedFlight.searchedFlightCode,
        flightDetailsCode: bookedFlight.flightDetailsCode,
        status: bookedFlight.statuses.filter((status => status.status !== 'ERROR')).pop()?.status,
        time: bookedFlight.time,
        origin: {
          code: bookedFlight.flightInfo.origin.code,
          name: bookedFlight.flightInfo.origin.name,
        },
        destination: {
          code: bookedFlight.flightInfo.destination.code,
          name: bookedFlight.flightInfo.destination.name,
        },
        travelClass: bookedFlight.flightInfo.travelClass,
        price: bookedFlight.flightInfo.flights.price.total,
        currencyCode: bookedFlight.flightInfo.flights.currencyCode,
        contact: {
          email: bookedFlight.contact.email,
          mobileNumber: bookedFlight.contact.mobileNumber,
        },
        passengers: bookedFlight.passengers.map(passenger => {
          const person = user.persons.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt)) ?? user.info
          return {
            type: person.type,
            gender: person.gender,
            firstName: person.firstName,
            lastName: person.lastName,
            middleName: person.middleName,
            nickName: person.nickName,
            birthDate: person.birthDate,
            document: {
              type: person.document.type,
              code: person.document.code,
              issuedAt: person.document.issuedAt,
              expirationDate: person.document.expirationDate,
              postCode: person.document.postCode,
            },
            ticketNumber: passenger.ticketNumber
          };
        }),
        ticketTimeLimit: new Date(bookedFlight.providerTimeout),
      }
    });

  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
};

// NOTE: Get available Routes by provider
module.exports.availableRoutes = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let timestamp = new Date().toISOString();
    let availableRoutes;

    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          availableRoutes = await worldticketHelper.availableRoutes(testMode);
      }
    }
    response.success(res, {
      timestamp,
      availableRoutes
    })
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
}

// NOTE: Get calendar Availability by provider
module.exports.calendarAvailability = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);

    let timestamp = new Date().toISOString();
    let availableDates;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          availableDates = await worldticketHelper.calendarAvailability(req.query, testMode);
      }
    }

    if (!!availableDates.error) {
      response.error(res, availableDates.error, 400);
      return;
    }

    response.success(res, {
      timestamp,
      availableDates
    })
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
}

// NOTE: Get flight Availability by provider
module.exports.airAvailable = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let timestamp = new Date().toISOString();
    let availableFlights;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          availableFlights = await worldticketHelper.airAvailable(req.query, testMode);
      }
    }

    if (!!availableFlights.error) {
      response.error(res, availableFlights.error, 400);
      return;
    }
    response.success(res, {
      timestamp,
      availableFlights
    })
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
}

// NOTE: Get price flight by provider
module.exports.airPrice = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let timestamp = new Date().toISOString();

    let flightDetails = await flightInfoRepository.getFlight(req.params.searchedFlightCode, req.params.flightDetailsCode);
    if (!flightDetails) {
      response.error(res, "flight_not_found", 404);
      return;
    }

    let priceInfo;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          priceInfo = await worldticketHelper.airPrice(flightDetails.flights, req.query, testMode);
      }
    }
    if (!!priceInfo.error) {
      response.error(res, priceInfo.error, 400);
      return;
    }
    const {
      origin,
      destination
    } = await flightHelper.getOriginDestinationCity(flightDetails.origin.code, flightDetails.destination.code);

    response.success(res, {
      timestamp,
      pricInfo: {
        origin,
        destination,
        date: flightDetails.time.$date,
        price: priceInfo
      }
    })
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
}

// NOTE: Get ticket flight by provider
module.exports.ticketDemand = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let timestamp = new Date().toISOString();
    const bookedFlight = await bookedFlightRepository.findOne({
      bookedBy: decodedToken.owner,
      code: req.params.bookedId
    });
    let ticketInfo;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          ticketInfo = await worldticketHelper.issueBookedFlight(bookedFlight, testMode);
      }
    }
    if (!ticketInfo) {
      response.error(res, 'something_wrong', 400);
      return;
    }
    if (!!ticketInfo.error) {
      response.error(res, ticketInfo.error, 400);
      return;
    }

    let index = 0;
    bookedFlight.passengers.map(passenger => {
      passenger.ticketNumber = ticketInfo.tickets[index++].ticketNumber;
    });
    bookedFlight.statuses.push({
      status: EBookedFlightStatus.get("BOOKED"),
      description: '--- Issued bookFlight by API ---',
      changedBy: decodedToken.owner,
    });
    bookedFlight.save();

    response.success(res, {
      timestamp,
      ticketInfo
    })
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
}

module.exports.cancelBook = async (req, res) => {
  try {
    let decodedToken;
    try {
      decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    } catch (e) {
      console.error(e);
    }
    const testMode = req.params[0] === "/test";

    if (decodedToken.type !== 'THIRD_PARTY') {
      response.error(res, "Access denied", 403);
      return;
    }

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let timestamp = new Date().toISOString();
    const bookedFlight = await bookedFlightRepository.findOne({
      bookedBy: decodedToken.owner,
      code: req.params.bookedId
    });
    let canceled;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          canceled = await worldticketHelper.cancelBookFlight(bookedFlight, testMode);
      }
    }
    if (!!canceled.error) {
      response.error(res, canceled.error, 400);
      return;
    }

    bookedFlight.statuses.push({
      status: EBookedFlightStatus.get("CANCEL"),
      description: '--- Cancel bookFlight by API ---',
      changedBy: decodedToken.owner,
    });
    bookedFlight.save();

    response.success(res, {
      timestamp,
      canceled
    })
  } catch (e) {
    console.trace(`Code: 500, Message: `, e);
    response.error(res, 'provider_error', 500);
  }
}

// Internal Functions
const appendProviderResult = async (origin, destination, time, flights, searchCode, userType, testMode) => {
  let flightInfo = await flightInfoRepository.createFlightInfo(
    origin,
    destination,
    time,
    searchCode,
  );

  flightInfo.flights = flights;
  flightInfo.userType = userType;
  flightInfo.testMode = testMode;
  flightInfo.filter = flightHelper.getFilterLimitsFromFlightDetailsArray(flights);

  await flightInfo.save();

  return flightInfo;
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

const paymentTimeout = async args => {
  let paid = await bookedFlightRepository.hasStatus(args.code, "PAID");
  if (!!paid) {
    return;
  }
  let expire = await bookedFlightRepository.hasStatus(args.code, "EXPIRED_PAYMENT");
  if (!!expire) {
    return;
  }
  const bookedFlight = await bookedFlightRepository.findOne({ code: args.code });
  //TODO: cancel booked
  const providerName = EProvider.find(bookedFlight.providerName);

  try {
    await providerHelpers[providerName].cancelBookFlight(bookedFlight, args.mode);
    //TODO: change status
    bookedFlight.statuses.push({
      status: 'EXPIRED_PAYMENT',
      description: 'Your reservation has been canceled by the provider, Please book again.',
      changedBy: 'SERVICE',
    });
  } catch (e) {
    console.log(e)
    bookedFlight.statuses.push({
      status: 'ERROR',
      description: 'Did not cancel from provider, reason -> (Timeout Payment)',
      changedBy: "SERVICE",
    });
  }
  bookedFlight.save();
}