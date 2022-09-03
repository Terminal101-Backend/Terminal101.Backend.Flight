const express = require("express");
const router = express.Router();
const { flightController } = require("../controllers");
const { flightValidator } = require("../validations");

// NOTE: Get cities of country
router
  .get("/:code/city",
    (req, res, next) => {
      console.log("Get cities of country", req.params, req.body, req.query);
      next();
    },
    flightValidator.getCities.check(),
    flightController.getCities);

module.exports = router;
