const express = require("express");
const router = express.Router();
const {flightController} = require("../controllers");
const {flightValidator} = require("../validations");
const { checkAccess } = require("../middlewares");

// NOTE: Get popular flights
router
  .get("/popular",
    (req, res, next) => {
      console.log("Get popular flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.getPopularFlights.check,
    flightController.getPopularFlights);

// NOTE: Search flight origin/destination
router
  .get("/search",
    (req, res, next) => {
      console.log("Search flight", req.params, req.body, req.query);
      next();
    },
    flightValidator.searchFlights.check,
    flightController.searchFlights);

// NOTE: Get flight price
router
  .get("/search/:searchId/details/:flightCode/price",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFlightPrice.check,
    flightController.getFlightPrice);

// NOTE: Get flight details
router
  .get("/search/:searchId/details/:flightCode",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFlight.check,
    flightController.getFlight);

// NOTE: Get filter limits
router
  .get("/search/:searchId/limits",
    (req, res, next) => {
      console.log("Get filter limits", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFilterLimit.check,
    flightController.getFilterLimit);

// NOTE: Filter searched flight
router
  .get("/search/:searchId",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.filterFlights.check,
    flightController.filterFlights);

// NOTE: History searched flight
router
  .get("/history",
    (req, res, next) => {
      console.log("History flights", req.params, req.body, req.query);
      next();
    },
    // checkAccess.checkUserType("BUSINESS"),
    flightValidator.getHistoryFlights.check,
    flightController.getHistoryFlights);

// NOTE: Get popular flights
router
  .get("/tequila",
    (req, res, next) => {
      console.log("Get Tequila flights", req.params, req.body, req.query);
      next();
    },
    flightController.searchTequila);

module.exports = router;
