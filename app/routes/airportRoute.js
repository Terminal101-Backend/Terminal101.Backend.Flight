const express = require("express");
const router = express.Router({ mergeParams: true });
const { flightController } = require("../controllers");
const { flightValidator } = require("../validations");

// NOTE: Get cities of country
router
  .get("/:cityCode/airport",
    (req, res, next) => {
      console.log("Get airports of city", req.params, req.body, req.query);
      next();
    },
    flightValidator.getAirports.check(),
    flightController.getAirports);

module.exports = router;
