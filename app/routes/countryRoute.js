const express = require("express");
const router = express.Router();
const { flightController } = require("../controllers");
const { flightValidator } = require("../validations");

// NOTE: Get cities of country
router
  .get("/",
    (req, res, next) => {
      console.log("Get countries", req.params, req.body, req.query);
      next();
    },
    flightValidator.getCountries.check(),
    flightController.getCountries);

module.exports = router;
