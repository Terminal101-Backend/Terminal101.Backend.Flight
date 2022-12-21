const express = require("express");
const router = express.Router();
const { flightConditionController } = require("../controllers");
const { flightConditionValidator } = require("../validations");
const { checkAccess } = require("../middlewares");

// NOTE: Get all flight conditions
router
  .get("/",
    (req, res, next) => {
      console.log("Get all flight conditions", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS", "SERVICE", "SUPER_ADMIN", "ADMIN"),
    flightConditionValidator.getFlightConditions.check,
    flightConditionController.getFlightConditions);

// NOTE: Get one flight condition
router
  .get("/:code",
    (req, res, next) => {
      console.log("Get one flight condition", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS", "SERVICE", "SUPER_ADMIN", "ADMIN"),
    flightConditionValidator.getFlightCondition.check,
    flightConditionController.getFlightCondition);

// NOTE: Edit flight condition
router
  .patch("/:code",
    (req, res, next) => {
      console.log("Edit flight condition", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS", "SERVICE", "SUPER_ADMIN", "ADMIN"),
    flightConditionValidator.editFlightCondition.check,
    flightConditionController.editFlightCondition);

// NOTE: Add flight condition
router
  .post("/",
    (req, res, next) => {
      console.log("Add flight condition", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS", "SERVICE", "SUPER_ADMIN", "ADMIN"),
    flightConditionValidator.addFlightCondition.check,
    flightConditionController.addFlightCondition);

// NOTE: Delete flight condition
router
  .delete("/:code",
    (req, res, next) => {
      console.log("Delete flight condition", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS", "SERVICE", "SUPER_ADMIN", "ADMIN"),
    flightConditionValidator.deleteFlightCondition.check,
    flightConditionController.deleteFlightCondition);

module.exports = router;
