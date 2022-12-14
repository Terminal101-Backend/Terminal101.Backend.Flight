const express = require("express");
const router = express.Router();
const { flightController } = require("../controllers");
const { flightValidator } = require("../validations");

// NOTE: Get popular flights
router
  .get("/popular",
    (req, res, next) => {
      console.log("Get popular flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.getPopularFlights.check(),
    flightController.getPopularFlights);

// NOTE: Search flight origin/destination
router
  .get("/search",
    (req, res, next) => {
      console.log("Search flight", req.params, req.body, req.query);
      next();
    },
    flightValidator.searchFlights.check(true),
    flightController.searchFlights);

// NOTE: Get flight price
router
  .get("/search/:searchId/details/:flightCode/price",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFlightPrice.check(),
    flightController.getFlightPrice);

// NOTE: Get flight details
router
  .get("/search/:searchId/details/:flightCode",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFlight.check(true),
    flightController.getFlight);

// NOTE: Get filter limits
router
  .get("/search/:searchId/limits",
    (req, res, next) => {
      console.log("Get filter limits", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFilterLimit.check(),
    flightController.getFilterLimit);

// NOTE: Filter searched flight
router
  .get("/search/:searchId",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.filterFlights.check(),
    flightController.filterFlights);

module.exports = router;
