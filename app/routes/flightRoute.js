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
  .get("/",
    (req, res, next) => {
      console.log("Search flight", req.params, req.body, req.query);
      next();
    },
    flightValidator.searchFlights.check(),
    flightController.searchFlights);

module.exports = router;
