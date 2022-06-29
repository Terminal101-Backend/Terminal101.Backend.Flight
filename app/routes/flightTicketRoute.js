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
    // checkAccess.checkUserType("CLIENT"),
    flightTicketValidator.getFlightTickets.check(),
    flightTicketController.getFlightTickets);

// NOTE: Get flight tickets pdf
router
  .get("/view/:token/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get flight tickets", req.params, req.body, req.query);
      next();
    },
    flightTicketValidator.getFlightTicketsView.check(),
    flightTicketController.getFlightTicketsView);

// NOTE: Get other user's flight tickets
router
  .get("/:userCode/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get other user's flight tickets", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["SERVICE", "SUPER_ADMIN", "ADMIN"]),
    flightTicketValidator.getUserFlightTickets.check(),
    flightTicketController.getUserFlightTickets);

module.exports = router;
