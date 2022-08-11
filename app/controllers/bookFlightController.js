const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { partoHelper, amadeusHelper, emailHelper } = require("../helpers");
const token = require("../helpers/tokenHelper");
const { flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { accountManagement, wallet, amadeus } = require("../services");
const { EBookedFlightStatus, EProvider } = require("../constants");
const { twilio } = require("../services");
const flightTicketController = require("./flightTicketController");
const parto = require("../services/parto");

// NOTE: Book Flight
const pay = async (bookedFlight) => {
  try {
    const flightInfo = await flightInfoRepository.getFlight(bookedFlight.searchedFlightCode, bookedFlight.flightDetailsCode);
    if (!bookedFlight) {
      throw "flight_not_found";
    }
    // TODO: Check if PNR is generated by provider (FLight reserved)

    if (!bookedFlight.providerError) {
      (async () => {
        // TODO: Send notification to user
        const userToken = token.newToken({ user: bookedFlight.bookedBy });
        await flightTicketController.generatePdfTicket(userToken, bookedFlight.code);
        // TODO: Send SMS
        // await twilio.sendTicket(bookedFlight.contact.mobileNumber);
        await emailHelper.sendTicket(bookedFlight.contact.email, bookedFlight.code);
        // TODO: If user wallet's credit is less than flight price do... what???!!!
      })();

      bookedFlight.statuses.push({
        status: "INPROGRESS",
        description: "Paid",
        changedBy: bookedFlight.bookedBy,
      });

      let issued = true;
      // TODO: Issue by provider in socket mode
      // try {
      //   providerHelper = eval(EProvider.find(bookedFlight.providerName).toLowerCase() + "Helper");
      //   console.time("Issue by provider");
      //   const issuedBookedFlight = await providerHelper.issueBookedFlight(bookedFlight);
      //   console.timeEnd("Issue by provider");
      //   if (!!issuedBookedFlight) {
      //     bookedFlight.statuses.push({
      //       status: "BOOKED",
      //       description: "Issued automatically by " + EProvider.find(bookedFlight.providerName),
      //       changedBy: "SERVICE",
      //     });
      //   }
      // } catch (e) {
      //   issued = false;
      //   bookedFlight.statuses.push({
      //     status: "REJECTED",
      //     description: e,
      //     changedBy: "SERVICE",
      //   });
      // }

      if (!!issued) {
        await wallet.addAndConfirmUserTransaction(bookedFlight.bookedBy, -flightInfo.flights.price.total, "Book flight; code: " + bookedFlight.code + (!!bookedFlight.transactionId ? "; transaction id: " + bookedFlight.transactionId : ""));
      }

      bookedFlight.save();
    }
  } catch (e) {
    console.error("Pay error: ", e);
    throw e;
  }
};

// NOTE: Success payment callback
module.exports.payForFlight = async (req, res) => {
  try {
    const bookedFlight = await bookedFlightRepository.findOne({ transactionId: req.body.externalTransactionId });
    // TODO: Get last flight price from our DB
    await pay(bookedFlight);

    response.success(res, true);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Generate new payment information
module.exports.generateNewPaymentInfo = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));

    const bookedFlight = await bookedFlightRepository.findOne({ bookedBy: decodedToken.user, code: req.params.bookedFlightCode });
    const flightDetails = await flightInfoRepository.getFlight(bookedFlight.searchedFlightCode, bookedFlight.flightDetailsCode);
    const paymentMethod = await wallet.getPaymentMethod(req.body.paymentMethodName);
    const now = new Date();

    if (now - flightDetails.searchedTime > process.env.SEARCH_TIMEOUT) {
      throw "search_expired";
    }
    const userWallet = await wallet.getUserWallet(decodedToken.user);
    const lastStatus = bookedFlight.statuses[bookedFlight.statuses.length - 1].status;
    if (lastStatus === EBookedFlightStatus.get("PAYING")) {
      let amount = 0;
      let result = {};

      if (!!req.body.useWallet) {
        amount = Math.max(0, flightDetails.flights.price.total - userWallet.credit);
      } else {
        amount = flightDetails.flights.price.total;
        if (userWallet.credit < 0) {
          amount += Math.abs(userWallet.credit);
        }
      }

      switch (paymentMethod.type) {
        case "STRIPE":
          result = await wallet.chargeUserWallet(decodedToken.user, paymentMethod.name, amount);
          break;

        case "CRYPTOCURRENCY":
          result = await wallet.chargeUserWallet(decodedToken.user, paymentMethod.name, amount, req.body.currencySource, req.body.currencyTarget);
          // TODO: Create payment info and make transaction by crypto currency
          break;

        default:
          throw "payment_method_invalid";
      }

      bookedFlight.transactionId = result.externalTransactionId;
      await bookedFlight.save();

      if (!result) {
        bookedFlight.statuses.push({
          status: EBookedFlightStatus.get("INPROGRESS"),
          changedBy: decodedToken.user,
        });
      }
      response.success(res, {
        code: bookedFlight.code,
        ...result
      });
    } else {
      throw "payed";
    }
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Book a flight
module.exports.bookFlight = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));

    const flightDetails = await flightInfoRepository.getFlight(req.body.searchedFlightCode, req.body.flightDetailsCode);
    if (!flightDetails) {
      response.error(res, "flight_not_found", 404);
      return;
    }
    const paymentMethod = await wallet.getPaymentMethod(req.body.paymentMethodName);
    const { data: user } = await accountManagement.getUserInfo(decodedToken.user);

    // TODO: Check if the user has not booked similar flight
    // const existsBookedFlight = await bookedFlightRepository.getDuplicatedBookedFlight(req.body.passengers, flightDetails.flights.itinerarry);
    const existsBookedFlight = await bookedFlightRepository.findOne({ bookedBy: decodedToken.user, searchedFlightCode: req.body.searchedFlightCode, flightDetailsCode: req.body.flightDetailsCode });
    if (!!existsBookedFlight && !EBookedFlightStatus.check(["CANCEL", "REJECTED"], existsBookedFlight.statuses[existsBookedFlight.statuses.length - 1].status)) {
      response.error(res, "booked_flight_duplicated", 406);
      return;
    }

    if (!paymentMethod?.isActive) {
      throw "payment_method_inactive";
    }

    const passengers = req.body.passengers.map(passenger => {
      if (!!user.info && !!user.info.document && (user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)) {
        return {
          firstName: user.info.firstName,
          middleName: user.info.middleName,
          nickName: user.info.nickName,
          lastName: user.info.lastName,
          birthDate: user.info.birthDate,
          gender: user.info.gender,
        }
      } else {
        const userPerson = user.persons.find(person => (person.document.code === passenger.documentCode) && (person.document.issuedAt === passenger.documentIssuedAt));
        if (!userPerson) {
          throw "passenger_not_found";
        }
        return {
          firstName: userPerson.firstName,
          middleName: userPerson.middleName,
          nickName: userPerson.nickName,
          lastName: userPerson.lastName,
          birthDate: userPerson.birthDate,
          gender: userPerson.gender,
        }
      }
    });

    if (!passengers || (passengers.length === 0)) {
      throw "passenger_not_found";
    }

    // TODO: Get user info and persons to check request body data for passengers
    // TODO: Get last flight's price from provider
    // TODO: Set last flight's price in our DB

    let amount = 0;
    let result = {};

    const userWallet = await wallet.getUserWallet(decodedToken.user);
    if (!!req.body.useWallet) {
      amount = Math.max(0, flightDetails.flights.price.total - userWallet.credit);
    } else {
      amount = flightDetails.flights.price.total;
      if (userWallet.credit < 0) {
        amount += Math.abs(userWallet.credit);
      }
    }

    if (amount >= 1) {
      switch (paymentMethod.type) {
        case "STRIPE":
          result = await wallet.chargeUserWallet(decodedToken.user, paymentMethod.name, amount, req.body.currencySource, req.body.currencyTarget);
          if (!result) {
            throw "wallet_error";
          }
          break;

        case "CRYPTOCURRENCY":
          result = await wallet.chargeUserWallet(decodedToken.user, paymentMethod.name, amount, req.body.currencySource, req.body.currencyTarget);
          if (!result) {
            throw "wallet_error";
          }
          break;

        default:
      }
    } else {
      result = {
        value: 0,
      }
    }

    const providerName = flightDetails.flights.provider.toLowerCase();
    const providerHelper = eval(providerName + "Helper");
    console.time("Booking by provider");
    const providerBookResult = await providerHelper.bookFlight({ flightDetails, userCode: decodedToken.user, contact: req.body.contact, passengers: req.body.passengers })
    console.timeEnd("Booking by provider");
    console.log("Flight booked by ", providerName, providerBookResult);

    const bookedFlightSegments = [flightDetails.flights?.itineraries?.[0].segments?.[0]];
    const lastIndex = (flightDetails.flights?.itineraries?.[0].segments?.length ?? 0) - 1;
    if (lastIndex > 0) {
      bookedFlightSegments.push(flightDetails.flights?.itineraries?.[0].segments[lastIndex]);
    }
    const bookedFlight = await bookedFlightRepository.createBookedFlight(decodedToken.user, flightDetails.flights.provider, req.body.searchedFlightCode, req.body.flightDetailsCode, providerBookResult.bookedId, result.externalTransactionId, req.body.contact, req.body.passengers, bookedFlightSegments, flightDetails.flights?.travelClass, result.value === 0 ? "INPROGRESS" : "PAYING");
    // const providerName = flightDetails.flights.provider.toLowerCase();
    // const providerHelper = eval(providerName + "Helper");
    // providerHelper.bookFlight({ flightDetails, userCode: decodedToken.user, contact: req.body.contact, passengers: req.body.passengers })
    //   .then(res => {
    //     console.log("Flight booked by ", providerName, res);
    //     if (!!bookedFlight) {
    //       bookedFlight.providerPnr = res.bookedId;
    //       bookedFlight.save();
    //     }
    //   })
    //   .catch(e => {
    //     console.error("Provider error: ", e);
    //     bookedFlight.providerError = e;
    //     bookedFlight.statuses.push({
    //       status: "REJECTED",
    //       description: e,
    //       changedBy: "SERVICE",
    //     })
    //     bookedFlight.save();
    //   });

    if (amount === 0) {
      await pay(bookedFlight);
    }

    response.success(res, {
      code: bookedFlight.code,
      ...result
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Book flight for user
module.exports.bookFlightForUser = async (req, res) => {
  try {
    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Cancel/refund booked flight's status
module.exports.cancelBookedFlight = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const { data: user } = await accountManagement.getUserInfo(decodedToken.user);
    const bookedFlight = await bookedFlightRepository.findOne({ code: req.params.bookedFlightCode });
    const providerName = bookedFlight.providerName;

    if (!user) {
      throw "user_not_found";
    }

    if (!bookedFlight) {
      throw "flight_not_found";
    }

    const lastStatus = bookedFlight.statuses[bookedFlight.statuses.length - 1].status;
    if (EBookedFlightStatus.check(["PAYING", "INPROGRESS", "BOOKED"], lastStatus)) {
      // bookedFlight.status = EBookedFlightStatus.check(bookedFlight.status, "PAYING") ? "CANCEL" : "REFUND";
      const status = EBookedFlightStatus.check(lastStatus, "PAYING") ? "CANCEL" : "REFUND"

      bookedFlight.statuses.push({
        status,
        description: req.body.description,
        changedBy: decodedToken.user,
      });

      bookedFlight.refundTo = req.body.refundTo;
      bookedFlight.refundInfo = req.body.refundInfo;

      providerHelper = eval(EProvider.find(providerName).toLowerCase() + "Helper");
      try {
        await providerHelper.cancelBookFlight(bookedFlight);
      } catch (e) {
        bookedFlight.statuses.push({
          status: "REFUND_REJECTED",
          description: e?.message ?? e,
          changedBy: "SERVICE",
        });
      }

      await bookedFlight.save();
    }

    const result = await bookedFlightRepository.getBookedFlight(decodedToken.user, req.params.bookedFlightCode);
    response.success(res, {
      // bookedBy: bookedFlight.bookedBy,
      code: result.code,
      status: EBookedFlightStatus.find(result.status) ?? result.status,
      time: result.time,
      passengers: result.passengers.map(passenger => ({
        documentCode: passenger.documentCode,
        documentIssuedAt: passenger.documentIssuedAt,
      })),
      origin: {
        code: result.flightInfo.origin.code,
        name: result.flightInfo.origin.name,
      },
      destination: {
        code: result.flightInfo.destination.code,
        name: result.flightInfo.destination.name,
      },
      travelClass: result.flightInfo.travelClass,
      price: result.flightInfo.flights.price.total,
      currencyCode: result.flightInfo.flights.currencyCode
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Edit user's booked flight
module.exports.editUserBookedFlight = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const { data: user } = await accountManagement.getUserInfo(req.params.userCode);
    const bookedFlight = await bookedFlightRepository.findOne({ code: req.params.bookedFlightCode });
    const providerName = bookedFlight.providerName;

    let status = req.body.status;

    if (!user) {
      throw "user_not_found";
    }

    if (!bookedFlight) {
      throw "flight_not_found";
    }

    if (!!req.body.contact && !!req.body.contact.email && (req.body.contact.email !== bookedFlight.contact.email)) {
      bookedFlight.contact.email = req.body.contact.email;
    }

    if (!!req.body.contact && !!req.body.contact.mobileNumber && (req.body.contact.mobileNumber !== bookedFlight.contact.mobileNumber)) {
      bookedFlight.contact.mobileNumber = req.body.contact.mobileNumber;
    }

    if (!req.body.status) {
      status = bookedFlight.statuses[bookedFlight.statuses.length - 1].status;
    }

    bookedFlight.passengers = req.body.passengers.filter(passenger => user.persons.some(person => (person.document.code === passenger.documentCode) && (person.document.issuedAt === passenger.documentIssuedAt)) || ((user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)));

    if (bookedFlight.passengers.length === 0) {
      throw "passengers_not_valid";
    }

    bookedFlight.statuses.push({
      status,
      description: req.body.description,
      changedBy: decodedToken.user,
    });

    providerHelper = eval(EProvider.find(providerName).toLowerCase() + "Helper");
    switch (status) {
      case "BOOKED":
        try {
          await providerHelper.issueBookedFlight(bookedFlight);
        } catch (e) {
          bookedFlight.statuses.push({
            status: "REJECTED",
            description: e?.message ?? e,
            changedBy: "SERVICE",
          });
        }
        break;

      case "CANCEL":
      case "REJECTED":
        await providerHelper.cancelBookFlight(bookedFlight);
        break;

      default:
        break;
    }

    await bookedFlight.save();

    const result = await bookedFlightRepository.getBookedFlight(req.params.userCode, req.params.bookedFlightCode);
    response.success(res, {
      // bookedBy: bookedFlight.bookedBy,
      code: result.code,
      status: EBookedFlightStatus.find(result.status) ?? result.status,
      time: result.time,
      passengers: result.passengers.map(passenger => ({
        documentCode: passenger.documentCode,
        documentIssuedAt: passenger.documentIssuedAt,
      })),
      origin: {
        code: result.flightInfo.origin.code,
        name: result.flightInfo.origin.name,
      },
      destination: {
        code: result.flightInfo.destination.code,
        name: result.flightInfo.destination.name,
      },
      travelClass: result.flightInfo.travelClass,
      price: result.flightInfo.flights.price.total,
      currencyCode: result.flightInfo.flights.currencyCode
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flights list
module.exports.getBookedFlights = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const { data: user } = await accountManagement.getUserInfo(decodedToken.user);

    const { items: bookedFlights, ...result } = await bookedFlightRepository.getBookedFlights(decodedToken.user, req.header("Page"), req.header("PageSize"));

    response.success(res, {
      ...result,
      items: bookedFlights.map(bookedFlight => ({
        // bookedBy: bookedFlight.bookedBy,
        code: bookedFlight.code,
        searchedFlightCode: bookedFlight.searchedFlightCode,
        flightDetailsCode: bookedFlight.flightDetailsCode,
        status: EBookedFlightStatus.find(bookedFlight?.status) ?? bookedFlight?.status,
        time: bookedFlight.time,
        passengers: bookedFlight.passengers.map(passenger => user.persons.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt)) ?? user.info),
        contact: {
          email: bookedFlight.contact.email,
          mobileNumber: bookedFlight.contact.mobileNumber,
        },
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
        currencyCode: bookedFlight.flightInfo.flights.currencyCode
      }))
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific user's booked flights list
module.exports.getUserBookedFlights = async (req, res) => {
  try {
    const bookedFlights = await bookedFlightRepository.getBookedFlights(req.params.userCode);
    if (!bookedFlights) {
      throw "not_found";
    }

    response.success(res, bookedFlights.map(bookedFlight => ({
      // bookedBy: bookedFlight.bookedBy,
      code: bookedFlight.code,
      status: EBookedFlightStatus.find(bookedFlight?.status) ?? bookedFlight?.status,
      time: bookedFlight.time,
      passengers: bookedFlight.passengers.map(passenger => ({
        documentCode: passenger.documentCode,
        documentIssuedAt: passenger.documentIssuedAt,
      })),
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
    })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flight's details
module.exports.getBookedFlight = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const { data: user } = await accountManagement.getUserInfo(decodedToken.user);

    const bookedFlight = await bookedFlightRepository.getBookedFlight(decodedToken.user, req.params.bookedFlightCode);
    const transaction = await wallet.getUserTransaction(decodedToken.user, bookedFlight.transactionId);

    response.success(res, {
      // bookedBy: bookedFlight.bookedBy,
      code: bookedFlight.code,
      searchedFlightCode: bookedFlight.searchedFlightCode,
      flightDetailsCode: bookedFlight.flightDetailsCode,
      status: EBookedFlightStatus.find(bookedFlight?.status) ?? bookedFlight?.status,
      time: bookedFlight.time,
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
          },
        };
      }),
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
      transaction,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flight's statuses
module.exports.getBookedFlightStatus = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const bookedFlight = await bookedFlightRepository.getBookedFlight(decodedToken.user, req.params.bookedFlightCode);

    response.success(res, {
      code: bookedFlight.code,
      status: bookedFlight.statuses.map(status => ({
        status: EBookedFlightStatus.find(status.status) ?? status.status,
        time: status.time,
        changedBy: status.changedBy,
        description: status.description,
      })),
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get user's booked flight's statuses
module.exports.getUserBookedFlightStatus = async (req, res) => {
  try {
    const bookedFlight = await bookedFlightRepository.getBookedFlight(req.params.userCode, req.params.bookedFlightCode);
    if (!bookedFlight) {
      throw "not_found";
    }

    response.success(res, {
      code: bookedFlight.code,
      status: bookedFlight.statuses.map(status => ({
        status: EBookedFlightStatus.find(status.status) ?? status.status,
        time: status.time,
        changedBy: status.changedBy,
        description: status.description,
      })),
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific user's booked flight's details
module.exports.getUserBookedFlight = async (req, res) => {
  try {
    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};