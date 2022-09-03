const express = require("express");
const router = express.Router();
const { flightController } = require("../controllers");
const { flightValidator } = require("../validations");

// NOTE: Get cities of country
router
  .get("/:countryCode/:cityCode?",
    (req, res, next) => {
      console.log("Get country/city restriction data", req.params, req.body, req.query);
      next();
    },
    flightValidator.restrictionCovid19.check(),
    flightController.restrictionCovid19);

module.exports = router;
