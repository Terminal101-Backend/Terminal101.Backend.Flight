const { EFlightWaypoint, ETravelClass, EFeeType } = require("../constants");
const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const dateTime = require("../helpers/dateTimeHelper");
const { getIpInfo } = require("../services/ip");
const { countryRepository, flightInfoRepository } = require("../repositories");
const { FlightInfo } = require("../models/documents");
const { amadeus } = require("../services");

// NOTE: Flight
// NOTE: Book a flight
module.exports.bookFlight = async (req, res) => {
  try {
    // TODO: Use wallet's service and create a transaction

    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};
