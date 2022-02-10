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

// NOTE: Get flight details
router
  .get("/search/:searchId/details/:flightIndex",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFlight.check(),
    flightController.getFlight);

// NOTE: Get filter limits
router
  .get("/search/:searchId/filters",
    (req, res, next) => {
      console.log("Get filter limits", req.params, req.body, req.query);
      next();
    },
    flightValidator.getFilters.check(),
    flightController.getFilters);

// NOTE: Filter searched flight
router
  .get("/search/:searchId",
    (req, res, next) => {
      console.log("Filter flights", req.params, req.body, req.query);
      next();
    },
    flightValidator.filterFlights.check(),
    flightController.filterFlights);

// NOTE: Search flight origin/destination
router
  .get("/search",
    (req, res, next) => {
      console.log("Search flight", req.params, req.body, req.query);
      next();
    },
    flightValidator.searchFlights.check(),
    flightController.searchFlights);

module.exports = router;
