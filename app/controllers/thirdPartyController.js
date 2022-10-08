const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { providerRepository } = require("../repositories");
const { EProvider } = require("../constants");
const { amadeus, parto, avtra, accountManagement } = require("../services");
const { tokenHelper, avtraHelper } = require("../helpers");
// NOTE: Search flights by provider
module.exports.lowFareSearch = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);
    let result = {
      flightDetails: [],
    };

    for (const provider of availableProviders) {
      switch (provider) {
        case "AVTRA":
          const providerResult = await avtraHelper.searchFlights(req.query);

          result.origin = providerResult.origin;
          result.destination = providerResult.destination;
          result.flightDetails.push(...providerResult.flightDetails);
      }
    };

    response.success(res, result);

    // const result = await avtra.lowFareSearch(
    //   req.query.originLocationCode,
    //   req.query.destinationLocationCode,
    //   req.query.departureDate,
    //   req.query.returnDate,
    //   req.query.segments,
    //   req.query.adults,
    //   req.query.children,
    //   req.query.infants,
    //   req.query.travelClass,
    //   req.query.includedAirlineCodes,
    //   req.query.excludedAirlineCodes,
    //   req.query.nonStop,
    //   req.query.currencyCode,
    //   testMode);

    // if (!!result.success) {
    //   response.success(res, result.data);
    // } else {
    //   throw "Provider error " + result.error.code + ": " + result.error.message;
    // }
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Book flight by provider
module.exports.bookFlight = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);

    const result = await avtra.book(
      req.body.segments,
      req.body.price,
      req.body.contact,
      req.body.travelers,
      testMode);

    if (!!result.success) {
      response.success(res, result.data);
    } else {
      throw "Provider error " + result.error.code + ": " + result.error.message;
    }
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get booked flight by provider
module.exports.getBookedFlight = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const testMode = req.params[0] === "/test";

    const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.owner, decodedToken.user);

    const result = await avtra.getBooked(
      req.params.bookedId,
      testMode);

    if (!!result.success) {
      response.success(res, result.data);
    } else {
      throw "Provider error " + result.error.code + ": " + result.error.message;
    }
  } catch (e) {
    response.exception(res, e);
  }
};
