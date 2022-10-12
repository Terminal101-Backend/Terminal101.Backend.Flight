const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { providerRepository, flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { EBookedFlightStatus, EProvider, EUserType } = require("../constants");
const { amadeus, parto, avtra, accountManagement, wallet } = require("../services");
const { tokenHelper, avtraHelper, worldticketHelper, flightHelper, arrayHelper } = require("../helpers");
// NOTE: Search flights by provider
module.exports.lowFareSearch = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";

    let timestamp = new Date().toISOString();

    // const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let availableProviders = ["WORLDTICKET"]
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

    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          await worldticketHelper.searchFlights(req.query, true).then(async flight => {
            lastSearch.push(...flight.flightDetails);
            appendProviderResult(flight.origin, flight.destination, req.query.departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize")).catch(e => {
              console.trace(e);
            });
          })
      }
    }
    response.success(res, {
      timestamp,
      searchResult: getSearchFlightsByPaginate(flightInfo, lastSearch, req.header("Page"), req.header("PageSize"))
    });

  } catch (e) {
    console.trace(e);
    response.exception(res, e);
  }
};

// NOTE: Book flight by provider
module.exports.book = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";

    // const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
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

    const { data: user } = await accountManagement.getUserInfo("YYEO69EXLHV3PS5");
    const existsBookedFlight = await bookedFlightRepository.findOne({
      bookedBy: "YYEO69EXLHV3PS5",
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

    let worldticketBookResult;
    let bookedFlight;
    switch (providerName) {
      case "WORLDTICKET":
        worldticketBookResult = await worldticketHelper.bookFlight({
          flightDetails,
          userCode: "YYEO69EXLHV3PS5",
          contact: req.body.contact,
          passengers: req.body.passengers
        }, testMode);

        const userWallet = await wallet.getUserWallet("YYEO69EXLHV3PS5");
        bookedFlight = await bookedFlightRepository.createBookedFlight("YYEO69EXLHV3PS5", flightDetails.flights.provider, req.body.searchedFlightCode, req.body.flightDetailsCode, worldticketBookResult.bookedId, userWallet.externalTransactionId, req.body.contact, req.body.passengers, bookedFlightSegments, flightDetails.flights?.travelClass, "RESERVED");
        const flightInfo = await flightInfoRepository.getFlight(bookedFlight.searchedFlightCode, bookedFlight.flightDetailsCode);

        bookedFlight.statuses.push({
          status: EBookedFlightStatus.get("PAYING"),
          description: 'Payment is in progress',
          changedBy: "SERVICE",
        });

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

          await bookedFlight.save();
        }
        else {
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get("PAYING"),
            description: "Client credit is not enough",
            changedBy: "SERVICE",
          });
          await bookedFlight.save();
        }
    }
    bookedFlight = await bookedFlightRepository.getBookedFlight("YYEO69EXLHV3PS5", bookedFlight.code);

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
        })
      }
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flight by provider
module.exports.readBook = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";

    let timestamp = new Date().toISOString();

    const bookedFlight = await bookedFlightRepository.getBookedFlight("YYEO69EXLHV3PS5", req.params.bookedId);
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
            }
          };
        })
      }
    });

  } catch (e) {
    response.exception(res, e);
  }
};

module.exports.availableRoutes = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";
    // const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    const availableProviders = ["WORLDTICKET"];
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
    response.exception(res, e);
  }
}

module.exports.calendarAvailability = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";
    // const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let availableProviders = ["WORLDTICKET"];

    let timestamp = new Date().toISOString();
    let availableDates;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          availableDates = await worldticketHelper.calendarAvailability(req.query, testMode);
      }
    }

    response.success(res, {
      timestamp,
      availableDates
    })
  } catch (e) {
    response.exception(res, e);
  }
}

module.exports.airAvailable = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";
    // const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let availableProviders = ["WORLDTICKET"];
    let timestamp = new Date().toISOString();
    let availableFlights;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          availableFlights = await worldticketHelper.airAvailable(req.query, testMode);
      }
    }

    response.success(res, {
      timestamp,
      availableFlights
    })
  } catch (e) {
    response.exception(res, e);
  }
}

module.exports.airPrice = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";
    // const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let availableProviders = ["WORLDTICKET"];
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
    response.exception(res, e);
  }
}

module.exports.ticketDemand = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";
    let availableProviders = ["WORLDTICKET"];

    let timestamp = new Date().toISOString();
    const bookedFlight = await bookedFlightRepository.getBookedFlight("YYEO69EXLHV3PS5", req.params.bookedId);

    let ticketInfo;
    for (const provider of availableProviders) {
      switch (provider) {
        case "WORLDTICKET":
          ticketInfo = await worldticketHelper.ticketDemand(bookedFlight.providerPnr, testMode);
      }
    }
    response.success(res, {
      timestamp,
      ticketInfo
    })
  } catch (e) {
    response.exception(res, e);
  }
}


const appendProviderResult = async (origin, destination, time, flights, searchCode) => {
  let flightInfo = await flightInfoRepository.createFlightInfo(
    origin,
    destination,
    time,
    searchCode,
  );

  flightInfo.flights = flights;
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