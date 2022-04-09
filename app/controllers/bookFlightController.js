const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const token = require("../helpers/tokenHelper");
const { flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { wallet, amadeus } = require("../services");
const { EBookedFlightStatus } = require("../constants");

// NOTE: Book Flight
// NOTE: Success payment callback
module.exports.payForFlight = async (req, res) => {
  try {
    let result = {};

    const bookedFlight = await bookedFlightRepository.findOne({ transactionId: req.body.externalTransactionId });
    if (!!bookedFlight) {
      bookedFlight.status = EBookedFlightStatus.get("INPROGRESS");
      await bookedFlight.save();
    }

    // TODO: Finilize book flight by Amadeus

    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Book a flight
module.exports.bookFlight = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));

    const flightInfo = await flightInfoRepository.getFlight(req.body.searchedFlightCode, req.body.flightDetailsCode);

    const paymentMethod = await wallet.getPaymentMethod(req.body.paymentMethodName);
    // TODO: Get last flight's price from provider

    let amount = 0;
    let result = {};

    switch (req.body.payWay) {
      case "WALLET":
        const userWallet = await wallet.getUserWallet(decodedToken.user);
        amount = Math.max(0, flightInfo.flight.price.total - userWallet.credit);
        break;

      case "PAY":
        amount = flightInfo.flight.price.total;
        break;

      default:
    }

    switch (paymentMethod.type) {
      case "STRIPE":
        result = await wallet.chargeUserWalletByCreditCard(decodedToken.user, amount);
        break;

      case "CRYPTOCURRENCY":
        // TODO: Create payment info and make transaction by crypto currency
        break;

      default:
    }

    const bookedFlight = await bookedFlightRepository.createBookedFlight(decodedToken.user, req.body.searchedFlightCode, req.body.flightDetailsCode, result.externalTransactionId);

    response.success(res, {
      code: bookedFlight.code,
      ...result
    });
  } catch (e) {
    response.exception(res, e);
  }
};

module.exports.bookFlightForUser = async (req, res) => {
  try {
    // TODO: Use wallet's service and create a transaction

    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flights list
module.exports.getBookedFlights = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));

    const result = await bookedFlightRepository.getBookedFlights(decodedToken.user);
    response.success(res, result.map(bookedFlight => ({
      bookedBy: bookedFlight.bookedBy,
      code: bookedFlight.code,
      status: EBookedFlightStatus.find(bookedFlight.status),
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
      travelClass: bookedFlight.flightInfo.searches.travelClass,
      price: bookedFlight.flightInfo.searches.flights.price.total,
    })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get specific user's booked flights list
module.exports.getUserBookedFlights = async (req, res) => {
  try {
    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flight's details
module.exports.getBookedFlight = async (req, res) => {
  try {
    response.success(res, result);
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
