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
    checkAccess.checkUserType("SERVICE"),
    bookFlightValidator.payForFlight.check,
    bookFlightController.payForFlight);

// NOTE: Get all booked flights list by user
router
  .get("/",
    (req, res, next) => {
      console.log("Get all booked flights by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN", "CLIENT", "BUSINESS"),
    bookFlightValidator.getBookedFlights.check,
    bookFlightController.getBookedFlights);

// NOTE: Get booked flight's statuses
router
  .get("/status/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get booked flight's statuses", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("CLIENT", "BUSINESS"),
    bookFlightValidator.getBookedFlightStatuses.check,
    bookFlightController.getBookedFlightStatuses);

// NOTE: Get user's booked flight's statuses
router
  .get("/status/:userCode/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get user's booked flight's statuses", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    bookFlightValidator.getUserBookedFlightStatuses.check,
    bookFlightController.getUserBookedFlightStatuses);

// NOTE: Change booked flight's status
router
  .delete("/:bookedFlightCode",
    (req, res, next) => {
      console.log("Change booked flight's status", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("CLIENT", "BUSINESS"),
    bookFlightValidator.cancelBookedFlight.check,
    bookFlightController.cancelBookedFlight);

// NOTE: Generate new payment information
router
  .patch("/pay/:bookedFlightCode",
    (req, res, next) => {
      console.log("Generate new payment information", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("CLIENT", "BUSINESS"),
    bookFlightValidator.generateNewPaymentInfo.check,
    bookFlightController.generateNewPaymentInfo);

// NOTE: Get Book flights history by business
router
  .get("/history",
    (req, res, next) => {
      console.log("Get Book flights history by business", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS"),
    bookFlightValidator.getBookedFlightsHistory.check,
    bookFlightController.getBookedFlightsHistory);

// NOTE: Get chart history by business
router
  .get("/history/chart/:category",
    (req, res, next) => {
      console.log("Get chart history by business", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS"),
    bookFlightValidator.getChartHistory.check,
    bookFlightController.getChartHistory);

// NOTE: Get specific booked flight's details by user
router
  .get("/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get all booked flights by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("CLIENT", "BUSINESS"),
    bookFlightValidator.getBookedFlight.check,
    bookFlightController.getBookedFlight);

// NOTE: Get specific user's booked flights
router
  .get("/:userCode",
    (req, res, next) => {
      console.log("Get specific user's booked flights", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    bookFlightValidator.getUserBookedFlights.check,
    bookFlightController.getUserBookedFlights);

// NOTE: Edit specific user's booked flight
router
  .patch("/:userCode/:bookedFlightCode",
    (req, res, next) => {
      console.log("Edit specific user's booked flight", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    bookFlightValidator.editUserBookedFlight.check,
    bookFlightController.editUserBookedFlight);

// NOTE: Get specific user's booked flight's details
router
  .get("/:userCode/:bookedFlightCode",
    (req, res, next) => {
      console.log("Get specific user's booked flights", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    bookFlightValidator.getUserBookedFlight.check,
    bookFlightController.getUserBookedFlight);

// NOTE: Book a flight by user
router
  .post("/",
    (req, res, next) => {
      console.log("Book a flight by user", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("CLIENT", "BUSINESS"),
    bookFlightValidator.bookFlight.check,
    bookFlightController.bookFlight);

// NOTE: Pay for Booked flight by userBusiness
router
  .post("/order/:bookedFlightCode",
    (req, res, next) => {
      console.log("Pay for Booked flight by userBusiness", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS"),
    bookFlightValidator.payBookedFlight.check,
    bookFlightController.payBookedFlight);

module.exports = router;
