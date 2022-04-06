const express = require("express");
const router = express.Router();
const { bookFlightController } = require("../controllers");
const { bookFlightValidator } = require("../validations");
const { checkAccess } = require("../middlewares");

// NOTE: Get all booked flights by user
router
  .get("/",
    (req, res, next) => {
      console.log("Get all booked flights by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    bookFlightValidator.getBookedFlights.check(),
    bookFlightController.getBookedFlights);

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
router
  .post("/:userCode",
    (req, res, next) => {
      console.log("Book a flight by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    bookFlightValidator.bookFlightForUser.check(),
    bookFlightController.bookFlightForUser);

// NOTE: Cancel booked flight by user
router
  .patch("/cancel/:searchedFlightCode/:flightDetailsCode",
    (req, res, next) => {
      console.log("Cancel booked flight by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["CLIENT"]),
    bookFlightValidator.editBookedFlight.check(),
    bookFlightController.editBookedFlight);

// NOTE: Book flight for user
router
  .patch("/cancel/:userCode/:searchedFlightCode/:flightDetailsCode",
    (req, res, next) => {
      console.log("Cancel booked flight for user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["SERVICE", "SUPER_ADMIN", "ADMIN"]),
    bookFlightValidator.editBookedFlightForUser.check(),
    bookFlightController.editBookedFlightForUser);
