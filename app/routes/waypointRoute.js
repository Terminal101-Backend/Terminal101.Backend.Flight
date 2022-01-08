const express = require("express");
const router = express.Router();
const { flightController } = require("../controllers");
const { flightValidator } = require("../validations");

// NOTE: Search flight origin/destination
router
  .get("/:waypointType",
    (req, res, next) => {
      console.log("Search waypoint", req.params, req.body, req.query);
      next();
    },
    flightValidator.searchOriginDestination.check(),
    flightController.searchOriginDestination);

module.exports = router;
