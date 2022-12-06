const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { partoHelper, amadeusHelper, avtraHelper, stringHelper, arrayHelper, worldticketHelper } = require("../helpers");
const token = require("../helpers/tokenHelper");
const { flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { accountManagement, wallet, amadeus } = require("../services");
const { EBookedFlightStatus, EProvider, EUserType, EFeeType } = require("../constants");
const { common } = require("../services");
const flightTicketController = require("./flightTicketController");

// NOTE: Book Flight
const pay = async (bookedFlight) => {
  try {
    const paid = await bookedFlightRepository.hasStatus(bookedFlight.code, "PAID");
    if (!!paid) {
      throw "paid";
    }

    const flightInfo = await flightInfoRepository.getFlight(bookedFlight.searchedFlightCode, bookedFlight.flightDetailsCode);
    if (!bookedFlight) {
      throw "flight_not_found";
    }
    // TODO: Check if PNR is generated by provider (FLight reserved)

    const userWallet = await wallet.getUserWallet(bookedFlight.bookedBy);

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

    if (userWallet.credit >= flightInfo.flights.price.total) {
      await wallet.addAndConfirmUserTransaction(bookedFlight.bookedBy, bookedFlight.businessCode, -flightInfo.flights.price.total, "Book flight; code: " + bookedFlight.code + (!!bookedFlight.transactionId ? "; transaction id: " + bookedFlight.transactionId : ""));
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

      (async () => {
        try {
          // TODO: Send notification to user
          const userToken = token.newToken({ user: bookedFlight.bookedBy, type: "CLIENT" });
          const path = await flightTicketController.generatePdfTicket(userToken, bookedFlight.code);
          // TODO: Send SMS
          // await twilio.sendTicket(bookedFlight.contact.mobileNumber);
          // await emailHelper.sendTicket(bookedFlight.contact.email, bookedFlight.code);
          // should send path URL of Ticket
          await common.sendTicketFlightPDF(bookedFlight.contact.email, path).then(() => {
            console.log("Ticket sent");
          }).catch(err => {
            console.error(err);
          });
        } catch (err) {
          console.error(err);
        }
      })();
    } else {
      console.log('Your credit is not enough');
      bookedFlight.statuses.push({
        status: EBookedFlightStatus.get("PAYING"),
        description: "Client credit is not enough",
        changedBy: "SERVICE",
      });
      //TODO: send email or SMS to user message -> (Your credit is not enough, please resharge your wallet and book again)

      await bookedFlight.save();
    }

  } catch (e) {
    console.error("Pay error: ", e);
    throw e;
  }
};

// NOTE: Timeout Payment
const paymentTimeout = async (args) => {
  let paid = await bookedFlightRepository.hasStatus(args.code, "PAID");
  if (!!paid) {
    return;
  }
  let expire = await bookedFlightRepository.hasStatus(args.code, "EXPIRED_PAYMENT");
  if (!!expire) {
    return;
  }
  const bookedFlight = await bookedFlightRepository.findOne({ code: args.code });
  // NOTE: cancel booked
  const providerName = bookedFlight.providerName;
  let providerHelper = eval(EProvider.find(providerName).toLowerCase() + "Helper");
  try {
    await providerHelper.cancelBookFlight(bookedFlight);
    // NOTE: cancel stripe or crypto
    if (!args.method) {
      let cancelStatus = await wallet.cancelPayment(bookedFlight.transactionId, args.method, args.timeout);

      if (cancelStatus !== 'canceled') {
        console.error(`cancel ${args.method} payment failed. status: `, cancelStatus);
        return;
      }
    }

    // NOTE: change status
    bookedFlight.statuses.push({
      status: 'EXPIRED_PAYMENT',
      description: 'Your reservation has been canceled by the provider, Please try again.',
      changedBy: 'SERVICE',
    });
  } catch (e) {
    console.trace(e);
    bookedFlight.statuses.push({
      status: 'ERROR',
      description: `Did not cancel from provider, reason -> (${e})`,
      changedBy: "SERVICE",
    });
  }
  bookedFlight.save();
}

// NOTE: Success payment callback
module.exports.payForFlight = async (req, res) => {
  try {
    const bookedFlight = await bookedFlightRepository.findOne({ transactionId: req.body.externalTransactionId });
    // TODO: Get last flight price from our DB

    if (!!req.body.confirmed)
      await pay(bookedFlight);
    else if (!await bookedFlightRepository.hasStatus(bookedFlight.code, "EXPIRED_PAYMENT")) {
      //send SMS or Email to passenger
      bookedFlight.statuses.push({
        status: EBookedFlightStatus.get("PAYING"),
        description: 'Your last payment failed, Please try again',
        changedBy: "SERVICE",
      });
    }
    bookedFlight.save();
    response.success(res, true);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Generate new payment information
module.exports.generateNewPaymentInfo = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const bookedFlight = await bookedFlightRepository.findOne({
      bookedBy: decodedToken.user,
      code: req.params.bookedFlightCode
    });
    const flightDetails = await flightInfoRepository.getFlight(bookedFlight.searchedFlightCode, bookedFlight.flightDetailsCode);
    const paymentMethod = await wallet.getPaymentMethod(req.body.paymentMethodName);
    const now = new Date();

    const paid = await bookedFlightRepository.hasStatus(bookedFlight.code, "PAID");
    if (!!paid) {
      throw "paid";
    }

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
    let testMode = process.env.TEST_MODE != "false";
    const decodedToken = token.decodeToken(req.header("Authorization"));

    let flightDetails = await flightInfoRepository.getFlight(req.body.searchedFlightCode, req.body.flightDetailsCode);
    if (!flightDetails) {
      response.error(res, "flight_not_found", 404);
      return;
    }
    const paymentMethod = decodedToken.type === 'CLIENT' ? await wallet.getPaymentMethod(req.body.paymentMethodName) : undefined;
    const { data: user } = await accountManagement.getUserInfo(decodedToken.user);

    const duplicateBook = await bookedFlightRepository.getDuplicatedBookedFlight(req.body.passengers, flightDetails.flights.itineraries[0]);
    if (!!duplicateBook) {
      response.error(res, "already_booked_flight", 406);
      return;
    }
    const existsBookedFlight = await bookedFlightRepository.findOne({
      bookedBy: decodedToken.user,
      searchedFlightCode: req.body.searchedFlightCode,
      flightDetailsCode: req.body.flightDetailsCode
    });
    if (!!existsBookedFlight && !EBookedFlightStatus.check(["CANCEL", "REJECTED"], existsBookedFlight.statuses[existsBookedFlight.statuses.length - 1].status)) {
      response.error(res, "booked_flight_duplicated", 406);
      return;
    }

    if (decodedToken.type === 'CLIENT' && !paymentMethod?.isActive) {
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
    let userWalletResult = {};

    const providerName = flightDetails.flights.provider.toLowerCase();
    const providerHelper = eval(providerName + "Helper");

    const bookedFlightSegments = [flightDetails.flights?.itineraries?.[0].segments?.[0]];
    const lastIndex = (flightDetails.flights?.itineraries?.[0].segments?.length ?? 0) - 1;
    if (lastIndex > 0) {
      bookedFlightSegments.push(flightDetails.flights?.itineraries?.[0].segments[lastIndex]);
    }

    const newPrice = await providerHelper.airRevalidate(flightDetails, testMode);
    const oldPrice = flightDetails.flights.price.total;

    if (!!newPrice.error) {
      response.exception(res, newPrice.error);
      return;
    }

    let commissionValue = 0;

    newPrice.total += flightDetails.flights.price.commissions.reduce((res, cur) => {
      let commissionPercent = newPrice.base;
      commissionPercent *= cur.percent / 100;
      commissionPercent = Math.round(commissionPercent * 100) / 100;

      commissionValue += commissionPercent + cur.constant;
      res += commissionValue;

      return res;
    }, 0);

    let priceChanged = (oldPrice - newPrice.total !== 0);
    if (!!priceChanged) {
      await flightInfoRepository.updateFlightDetails(req.body.searchedFlightCode, req.body.flightDetailsCode, newPrice);
      // flightDetails = await flightInfoRepository.getFlight(req.body.searchedFlightCode, req.body.flightDetailsCode);

      newPrice.fees.push({
        amount: commissionValue,
        type: EFeeType.get("COMMISSION"),
      });

      response.success(res, {
        priceChanged,
        price: newPrice,
      });
      return;
    }

    const providerBookResult = await providerHelper.bookFlight({
      flightDetails,
      userCode: decodedToken.user,
      contact: req.body.contact,
      passengers: req.body.passengers
    }, testMode);
    const userWallet = await wallet.getUserWallet(decodedToken.user);

    if (!!req.body.useWallet) {
      amount = Math.max(0, flightDetails.flights.price.total - userWallet.credit);
    } else {
      amount = flightDetails.flights.price.total;
      if (userWallet.credit < 0) {
        amount += Math.abs(userWallet.credit);
      }
    }

    if ((decodedToken.type === 'CLIENT') && (amount > 0)) {
      switch (paymentMethod.type) {
        case "STRIPE":
          userWalletResult = await wallet.chargeUserWallet(decodedToken.user, decodedToken.business, paymentMethod.name, amount, req.body.currencySource, req.body.currencyTarget);
          if (!userWalletResult) {
            throw "wallet_error";
          }
          break;

        case "CRYPTOCURRENCY":
          userWalletResult = await wallet.chargeUserWallet(decodedToken.user, decodedToken.business, paymentMethod.name, amount, req.body.currencySource, req.body.currencyTarget);
          if (!userWalletResult) {
            throw "wallet_error";
          }
          break;

        default:
      }
    } else {
      userWalletResult = {
        value: 0,
      };
    }

    const bookedFlight = await bookedFlightRepository.createBookedFlight(decodedToken.user, decodedToken.business, flightDetails.flights.provider, req.body.searchedFlightCode, req.body.flightDetailsCode, providerBookResult.bookedId, userWalletResult.externalTransactionId, req.body.contact, req.body.passengers, bookedFlightSegments, flightDetails.flights?.travelClass, "RESERVED");

    bookedFlight.statuses.push({
      status: EBookedFlightStatus.get("PAYING"),
      description: 'Payment is in progress',
      changedBy: "SERVICE",
    });

    //NOTE: Set Timer on Timeout
    let timeoutProvider = providerBookResult.timeout > 0 ? providerBookResult.timeout : new Date().getTime() + parseInt(process.env.PAYMENT_TIMEOUT_CREDIT);
    let timeout = (!paymentMethod || (paymentMethod.type === 'STRIPE')) ?
      Math.max(timeoutProvider - new Date().getTime() - parseInt(process.env.PAYMENT_TIMEOUT), parseInt(process.env.MIN_TIMEOUT)) :
      Math.max(Math.min(timeoutProvider - new Date().getTime() - parseInt(process.env.PAYMENT_TIMEOUT), parseInt(process.env.PAYMENT_TIMEOUT_CRYPTO)), parseInt(process.env.MIN_TIMEOUT));
    setTimeout(paymentTimeout, timeout, { code: bookedFlight.code, method: paymentMethod?.type, timeout: timeoutProvider });

    bookedFlight.providerTimeout = timeoutProvider;
    // bookedFlight.transactionId = userWalletResult.externalTransactionId;
    await bookedFlight.save();

    if ((decodedToken.type === 'CLIENT') && (amount <= 0)) {
      await pay(bookedFlight);
    }

    response.success(res, {
      priceChanged,
      code: bookedFlight.code,
      ...userWalletResult
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

    const lastStatus = bookedFlight.statuses[bookedFlight.statuses.length - 1];
    if (EBookedFlightStatus.check(["REFUND", "PAYING", "RESERVED", "PAID", "INPROGRESS", "BOOKED"], lastStatus.status)) {
      // const status = EBookedFlightStatus.check(lastStatus, "PAYING") ? "CANCEL" : "REFUND";
      const status = await bookedFlightRepository.hasStatus(bookedFlight.code, "PAID") ? "REFUND" : "CANCEL";

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
        bookedFlight.statuses.push({
          status: EBookedFlightStatus.get("REJECTED"),
          description: req.body.description,
          changedBy: decodedToken.user,
        });
      } catch (e) {
        if (status === "REFUND") {
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get("REFUND_REJECTED"),
            description: e?.message ?? e,
            changedBy: "SERVICE",
          });
        }

        bookedFlight.statuses.push({
          status: lastStatus.status,
          description: lastStatus.description,
          changedBy: "SERVICE",
        });
      }

      await bookedFlight.save();
    }

    const result = await bookedFlightRepository.getBookedFlight(decodedToken.user, req.params.bookedFlightCode);
    response.success(res, {
      // bookedBy: bookedFlight.bookedBy,
      code: result.code,
      status: result.statuses.filter((status => status.status !== 'ERROR')).pop()?.status,
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
    let testMode = process.env.TEST_MODE != false;
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
      case "BOOK":
        console.log(status);
        try {
          let ticketInfo = await providerHelper.issueBookedFlight(bookedFlight, testMode);
          let index = 0;
          bookedFlight.passengers.map(passenger => {
            passenger.ticketNumber = ticketInfo.tickets[index++].ticketNumber;
          });
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get('BOOKED'),
            description: 'The Flight Booked by Provider.',
            changedBy: 'SERVER',
          });
        } catch (e) {
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get("ERROR"),
            description: e?.message ?? e,
            changedBy: "SERVICE",
          });
        }
        break;

      case "CANCEL" | "REJECT":
        try {
          await providerHelper.cancelBookFlight(bookedFlight);
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get('REJECTED'),
            description: 'The Flight rejected by Provider.',
            changedBy: 'SERVER',
          });
        } catch (e) {
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get("ERROR"),
            description: e?.message ?? e,
            changedBy: "SERVICE",
          });
        }
        break;

      case "REFUND":
        try {
          //TODO: refund to wallet's user
          //TODO: refundInfo & refundTo
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get('REFUNDED'),
            description: 'The Flight refunded by Provider.',
            changedBy: 'SERVER',
          });
        } catch (e) {
          bookedFlight.statuses.push({
            status: EBookedFlightStatus.get("ERROR"),
            description: e?.message ?? e,
            changedBy: "SERVICE",
          });
        }
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
    let userCode;
    let businessCode;

    if (EUserType.check(["CLIENT", "BUSINESS"], decodedToken.type)) {
      userCode = decodedToken.user;
      businessCode = decodedToken.business;
    } else
      businessCode = 'ADMIN';
    console.time("Get booked flights: Get booked flight");
    const {
      items: bookedFlights,
      ...result
    } = await bookedFlightRepository.getBookedFlights(userCode, businessCode, req.header("Page"), req.header("PageSize"), req.query.filter, req.query.sort);
    console.timeEnd("Get booked flights");
    console.time("Get booked flights: Get users");
    const { data: users } = await accountManagement.getUsersInfo(bookedFlights.map(flight => flight.bookedBy));
    console.timeEnd("Get booked flights: Get users");

    console.time("Get booked flights: Prepaire result");
    response.success(res, {
      ...result,
      items: bookedFlights.map(bookedFlight => {
        const user = users.find(u => u.code === bookedFlight.bookedBy);
        return {
          bookedBy: EUserType.check(["CLIENT", "BUSINESS"], decodedToken.type) ? undefined : bookedFlight.bookedBy,
          provider: EUserType.check(["CLIENT", "BUSINESS"], decodedToken.type) ? undefined : bookedFlight.providerName,
          providerPnr: EUserType.check(["CLIENT", "BUSINESS"], decodedToken.type) ? undefined : bookedFlight.providerPnr,
          email: user?.email,
          code: bookedFlight.code,
          searchedFlightCode: bookedFlight.searchedFlightCode,
          flightDetailsCode: bookedFlight.flightDetailsCode,
          status: EUserType.check(["CLIENT", "BUSINESS"], decodedToken.type) ? bookedFlight.statuses.filter((status => status.status !== 'ERROR')).pop()?.status : EBookedFlightStatus.find(bookedFlight?.status) ?? bookedFlight?.status,
          time: bookedFlight.time,
          passengers: bookedFlight.passengers.map(passenger => user?.persons?.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt)) ?? user?.info),
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
          currencyCode: bookedFlight.flightInfo.flights.currencyCode,
          userType: EUserType.check(["CLIENT"], decodedToken.type) ? undefined : bookedFlight.flightInfo.userType,
          testMode: EUserType.check(["CLIENT"], decodedToken.type) ? undefined : bookedFlight.flightInfo.testMode,
        };
      })
    });
    console.timeEnd("Get booked flights: Prepaire result");
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific user's booked flights list
module.exports.getUserBookedFlights = async (req, res) => {
  try {
    const bookedFlights = await bookedFlightRepository.getBookedFlights(req.params.userCode, req.header("Page"), req.header("PageSize"), req.query.filter, req.query.sort);
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
    const transaction = bookedFlight.transactionId ? await wallet.getUserTransaction(decodedToken.user, bookedFlight.transactionId) : {};
    //.filter((status => status.status !== 'ERROR'))
    response.success(res, {
      // bookedBy: bookedFlight.bookedBy,
      bookedBy: EUserType.check(["CLIENT"], decodedToken.type) ? undefined : bookedFlight.bookedBy,
      provider: EUserType.check(["CLIENT"], decodedToken.type) ? undefined : bookedFlight.providerName,
      pnr: EUserType.check(["CLIENT"], decodedToken.type) ? undefined : bookedFlight.providerPnr,
      email: user.email,
      code: bookedFlight.code,
      searchedFlightCode: bookedFlight.searchedFlightCode,
      flightDetailsCode: bookedFlight.flightDetailsCode,
      status: EUserType.check(["CLIENT"], decodedToken.type) ? bookedFlight.statuses.filter((status => status.status !== 'ERROR')).pop()?.status : EBookedFlightStatus.find(bookedFlight?.status) ?? bookedFlight?.status,
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
      travelClass: bookedFlight.flightInfo.flights.travelClass,
      price: bookedFlight.flightInfo.flights.price.total,
      currencyCode: bookedFlight.flightInfo.flights.currencyCode,
      transaction,
      userType: EUserType.check(["CLIENT"], decodedToken.type) ? undefined : bookedFlight.flightInfo.userType,
      testMode: EUserType.check(["CLIENT"], decodedToken.type) ? undefined : bookedFlight.flightInfo.testMode,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flight's statuses
module.exports.getBookedFlightStatuses = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const bookedFlight = await bookedFlightRepository.getBookedFlight(decodedToken.user, req.params.bookedFlightCode);
    const filteredResult = arrayHelper.filterAndSort(bookedFlight.statuses, req.query.filter, req.query.sort);
    const {
      items: paginatedResult,
      ...result
    } = arrayHelper.pagination(filteredResult, req.header("Page"), req.header("PageSize"));

    response.success(res, {
      code: bookedFlight.code,
      ...result,
      items: paginatedResult.map(status => ({
        status: EBookedFlightStatus.find(status.status) ?? status.status,
        time: status.time,
        changedBy: status.changedBy,
        description: status.description,
      })).filter(status => status.status !== 'ERROR'),
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get user's booked flight's statuses
module.exports.getUserBookedFlightStatuses = async (req, res) => {
  try {
    const bookedFlight = await bookedFlightRepository.getBookedFlight(req.params.userCode, req.params.bookedFlightCode);
    if (!bookedFlight) {
      throw "not_found";
    }
    const filteredResult = arrayHelper.filterAndSort(bookedFlight.statuses, req.query.filter, req.query.sort);
    const {
      items: paginatedResult,
      ...result
    } = arrayHelper.pagination(filteredResult, req.header("Page"), req.header("PageSize"));

    response.success(res, {
      code: bookedFlight.code,
      ...result,
      items: paginatedResult.map(status => ({
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
    const { data: user } = await accountManagement.getUserInfo(req.params.userCode);

    const bookedFlight = await bookedFlightRepository.getBookedFlight(req.params.userCode, req.params.bookedFlightCode);
    const transaction = bookedFlight.transactionId ? await wallet.getUserTransaction(req.params.userCode, bookedFlight.transactionId) : {};

    response.success(res, {
      // bookedBy: bookedFlight.bookedBy,
      bookedBy: bookedFlight.bookedBy,
      provider: bookedFlight.providerName,
      pnr: bookedFlight.providerPnr,
      email: user.email,
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

// NOTE: Get booked flights history
module.exports.getBookedFlightsHistory = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    let userCode = decodedToken.user;

    const {
      items: bookedFlights,
      ...result
    } = await bookedFlightRepository.getBookedFlightsHistory(userCode, decodedToken.business, req.header("Page"), req.header("PageSize"), req.query.filter, req.query.sort);

    const { data: user } = await accountManagement.getUserInfo(userCode);

    response.success(res, {
      ...result,
      items: bookedFlights.map(bookedFlight => {
        return {
          email: user?.email,
          code: bookedFlight.code,
          searchedFlightCode: bookedFlight.searchedFlightCode,
          flightDetailsCode: bookedFlight.flightDetailsCode,
          status: bookedFlight.statuses.filter((status => status.status !== 'ERROR')).pop()?.status,
          time: bookedFlight.time,
          passengers: bookedFlight.passengers.map(passenger => user?.persons?.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt)) ?? user?.info),
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
          currencyCode: bookedFlight.flightInfo.flights.currencyCode,
        };
      })
    });
  } catch (e) {
    console.log(e);
    response.exception(res, e);
  }
};

// NOTE: Get chart history by busines
module.exports.getChartHistory = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));

    const result = await bookedFlightRepository.getBookedFlightsChartHistory(decodedToken.business, req.params.category);

    result.forEach(r => {
      let counts = {};
      r["date"] = r._id
      r.statuses.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
        r[x.toLowerCase()] = counts[x];
      });
      delete r.statuses
      delete r._id
      delete r.count
    })

    response.success(res, result);
  } catch (e) {
    console.log(e);
    response.exception(res, e);
  }
};

// NOTE: Pay for Booked flight by userBusiness
module.exports.payBookedFlight = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    const bookedFlight = await bookedFlightRepository.findOne({
      code: req.params.bookedFlightCode,
      bookedBy: decodedToken.user
    });
    if (!await bookedFlightRepository.hasStatus(bookedFlight.code, "PAID") && !await bookedFlightRepository.hasStatus(bookedFlight.code, "EXPIRED_PAYMENT")) {
      await pay(bookedFlight);
    }

    response.success(res, true);
  } catch (e) {
    response.exception(res, e);
  }
};