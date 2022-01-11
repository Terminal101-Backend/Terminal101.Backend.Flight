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

// NOTE: Get popular waypoints
router
  .get("/:waypointType/popular",
    (req, res, next) => {
      console.log("Get popular waypoints", req.params, req.body, req.query);
      next();
    },
    flightValidator.getPopularWaypoints.check(),
    flightController.getPopularWaypoints);

module.exports = router;
