const express = require("express");
const router = express.Router();
const { bookFlightController } = require("../controllers");
const { bookFlightValidator } = require("../validations");
const { checkAccess } = require("../middlewares");

// NOTE: Success payment callback
router
  .post("/pay",
    (req, res, next) => {
      console.log("Success payment callback", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["SERVICE"]),
    bookFlightValidator.payForFlight.check(),
    bookFlightController.payForFlight);

// NOTE: Get all booked flights list by user
router
  .get("/",
    (req, res, next) => {
      console.log("Get all booked flights by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    bookFlightValidator.getBookedFlights.check(),
    bookFlightController.getBookedFlights);

// NOTE: Get specific user's booked flights list
// router
//   .get("/:userCode",
//     (req, res, next) => {
//       console.log("Get specific user's booked flights", req.params, req.body, req.query);
//       next();
//     },
//     checkAccess.checkUserType(["SERVICE", "SUPER_ADMIN", "ADMIN"]),
//     bookFlightValidator.getUserBookedFlights.check(),
//     bookFlightController.getUserBookedFlights);

// NOTE: Generate new payment information
router
  .patch("/pay/:bookedFlightCode",
    (req, res, next) => {
      console.log("Generate new payment information", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    bookFlightValidator.generateNewPaymentInfo.check(),
    bookFlightController.generateNewPaymentInfo);

// NOTE: Get specific booked flight's details by user
router
  .get("/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get all booked flights by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    bookFlightValidator.getBookedFlight.check(),
    bookFlightController.getBookedFlight);

// NOTE: Get specific user's booked flights
router
  .get("/:userCode",
    (req, res, next) => {
      console.log("Get specific user's booked flights", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["SERVICE", "SUPER_ADMIN", "ADMIN"]),
    bookFlightValidator.getUserBookedFlights.check(),
    bookFlightController.getUserBookedFlights);

// NOTE: Edit specific user's booked flight
router
  .patch("/:userCode/:bookedFlightCode",
    (req, res, next) => {
      console.log("Edit specific user's booked flight", req.params, req.body, req.query);
      next();
    },
    // checkAccess.checkUserType(["SERVICE", "SUPER_ADMIN", "ADMIN"]),
    bookFlightValidator.editUserBookedFlight.check(),
    bookFlightController.editUserBookedFlight);

// NOTE: Get specific user's booked flight's details
router
  .get("/:userCode/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get specific user's booked flights", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["SERVICE", "SUPER_ADMIN", "ADMIN"]),
    bookFlightValidator.getUserBookedFlight.check(),
    bookFlightController.getUserBookedFlight);

// NOTE: Book a flight by user
router
  .post("/",
    (req, res, next) => {
      console.log("Book a flight by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    bookFlightValidator.bookFlight.check(),
    bookFlightController.bookFlight);

// NOTE: Book a flight for a user
// router
//   .post("/:userCode",
//     (req, res, next) => {
//       console.log("Book a flight by user", req.params, req.body, req.query);
//       next();
//     },
//     checkAccess.checkUserType(["CLIENT"]),
//     bookFlightValidator.bookFlightForUser.check(),
//     bookFlightController.bookFlightForUser);

// NOTE: Cancel booked flight by user
// router
//   .patch("/cancel/:searchedFlightCode/:flightDetailsCode",
//     (req, res, next) => {
//       console.log("Cancel booked flight by user", req.params, req.body, req.query);
//       next();
//     },
//     checkAccess.checkUserType(["CLIENT"]),
//     bookFlightValidator.editBookedFlight.check(),
//     bookFlightController.editBookedFlight);

// NOTE: Book flight for user
// router
//   .patch("/cancel/:userCode/:searchedFlightCode/:flightDetailsCode",
//     (req, res, next) => {
//       console.log("Cancel booked flight for user", req.params, req.body, req.query);
//       next();
//     },
//     checkAccess.checkUserType(["SERVICE", "SUPER_ADMIN", "ADMIN"]),
//     bookFlightValidator.editBookedFlightForUser.check(),
//     bookFlightController.editBookedFlightForUser);

module.exports = router;
