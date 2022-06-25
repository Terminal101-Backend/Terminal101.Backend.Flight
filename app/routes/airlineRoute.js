const express = require("express");
const router = express.Router({ mergeParams: true });
const { flightController } = require("../controllers");
const { flightValidator } = require("../validations");

// NOTE: Get cities of country
router
  .get("/",
    (req, res, next) => {
      console.log("Get airlines", req.params, req.body, req.query);
      next();
    },
    flightValidator.getAirlines.check(),
    flightController.getAirlines);

module.exports = router;
