const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { providerRepository } = require("../repositories");
const { EProvider } = require("../constants");
const { amadeus, parto, avtra } = require("../services");

// NOTE: Search flights by provider
module.exports.lowFareSearch = async (req, res) => {
  try {
    const testMode = req.params[0] === "/test";

    const provider = await providerRepository.findOne({ title: req.params.providerTitle });
    if (!provider?.isActive) {
      response.error(res, "provider_not_found", 404);
      return;
    }

    const result = await avtra.lowFareSearch(
      req.query.originLocationCode,
      req.query.destinationLocationCode,
      req.query.departureDate,
      req.query.returnDate,
      req.query.segments,
      req.query.adults,
      req.query.children,
      req.query.infants,
      req.query.travelClass,
      req.query.includedAirlineCodes,
      req.query.excludedAirlineCodes,
      req.query.nonStop,
      req.query.currencyCode,
      testMode);

    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Book flight by provider
module.exports.book = async (req, res) => {
  try {
    const testMode = req.params[0] === "/test";

    const provider = await providerRepository.findOne({ title: req.params.providerTitle });
    if (!provider?.isActive) {
      response.error(res, "provider_not_found", 404);
      return;
    }

    const result = await avtra.lowFareSearch(
      req.query.originLocationCode,
      req.query.destinationLocationCode,
      req.query.departureDate,
      req.query.returnDate,
      req.query.segments,
      req.query.adults,
      req.query.children,
      req.query.infants,
      req.query.travelClass,
      req.query.includedAirlineCodes,
      req.query.excludedAirlineCodes,
      req.query.nonStop,
      req.query.currencyCode,
      testMode);

    response.success(res, result);
  } catch (e) {
    response.exception(res, e);
  }
};
