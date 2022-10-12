const express = require("express");
const router = express.Router({ mergeParams: true });
const { thirdPartyController } = require("../controllers");
const { thirdPartyValidator } = require("../validations");
const { checkAccess } = require("../middlewares");

// NOTE: Search flights
router
  .get("/low-fare-search",
    (req, res, next) => {
      console.log("Search flights", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("THIRD_PARTY"),
    // checkAccess.checkUserAccess,
    thirdPartyValidator.lowFareSearch.check,
    thirdPartyController.lowFareSearch);

// NOTE: Book flight
router
  .post("/book",
    (req, res, next) => {
      console.log("Book flight", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("THIRD_PARTY"),
    // checkAccess.checkUserAccess,
    thirdPartyValidator.book.check,
    thirdPartyController.book);

// NOTE: Get booked flight
router
  .get("/book/:bookedId",
    (req, res, next) => {
      console.log("Get booked flight", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("THIRD_PARTY"),
    // checkAccess.checkUserAccess,
    thirdPartyValidator.readBook.check,
    thirdPartyController.readBook);

// NOTE: Get booked flight
router
  .get("/available-routes",
    (req, res, next) => {
      console.log("Get booked flight", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("THIRD_PARTY"),
    // checkAccess.checkUserAccess,
    thirdPartyValidator.availableRoutes.check,
    thirdPartyController.availableRoutes);

// NOTE: Get booked flight
router
  .get("/calendar-availability",
    (req, res, next) => {
      console.log("Get booked flight", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("THIRD_PARTY"),
    // checkAccess.checkUserAccess,
    thirdPartyValidator.calendarAvailability.check,
    thirdPartyController.calendarAvailability);

// NOTE: Get booked flight
router
.get("/availability",
  (req, res, next) => {
    console.log("Get booked flight", req.params, req.body, req.query);
    next();
  },
  checkAccess.checkUserType("THIRD_PARTY"),
  // checkAccess.checkUserAccess,
  thirdPartyValidator.airAvailable.check,
  thirdPartyController.airAvailable);

// NOTE: Get booked flight
router
.get("/get-price/:searchedFlightCode/:flightDetailsCode",
  (req, res, next) => {
    console.log("Get booked flight", req.params, req.body, req.query);
    next();
  },
  checkAccess.checkUserType("THIRD_PARTY"),
  // checkAccess.checkUserAccess,
  thirdPartyValidator.airPrice.check,
  thirdPartyController.airPrice);

// NOTE: Get booked flight
router
.get("/ticket-demand/:bookedId",
  (req, res, next) => {
    console.log("Get booked flight", req.params, req.body, req.query);
    next();
  },
  checkAccess.checkUserType("THIRD_PARTY"),
  // checkAccess.checkUserAccess,
  thirdPartyValidator.ticketDemand.check,
  thirdPartyController.ticketDemand);

module.exports = router;
