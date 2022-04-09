const express = require("express");
const router = express.Router();
const { flightTicketController } = require("../controllers");
const { flightTicketValidator } = require("../validations");
const { checkAccess } = require("../middlewares");

// NOTE: Get flight tickets
router
  .get("/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get flight tickets", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    flightTicketValidator.getFlightTickets.check(),
    flightTicketController.getFlightTickets);

// NOTE: Get other user's flight tickets
router
  .get("/:userCode/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get other user's flight tickets", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    flightTicketValidator.getUserFlightTickets.check(),
    flightTicketController.getUserFlightTickets);

module.exports = router;
