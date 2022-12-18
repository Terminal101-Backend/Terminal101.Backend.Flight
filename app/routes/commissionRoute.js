const express = require("express");
const router = express.Router();
const { commissionController } = require("../controllers");
const { commissionValidator } = require("../validations");
const { checkAccess } = require("../middlewares");

// NOTE: Get all commissions
router
  .get("/",
    (req, res, next) => {
      console.log("Get all commissions", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    commissionValidator.getCommissions.check,
    commissionController.getCommissions);

// NOTE: Get one commission
router
  .get("/:code",
    (req, res, next) => {
      console.log("Get one commission", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    commissionValidator.getCommission.check,
    commissionController.getCommission);

// NOTE: Edit commission
router
  .patch("/:code",
    (req, res, next) => {
      console.log("Edit commission", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    commissionValidator.editCommission.check,
    commissionController.editCommission);

// NOTE: Add commission
router
  .post("/",
    (req, res, next) => {
      console.log("Add commission", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("BUSINESS", "SERVICE", "SUPER_ADMIN", "ADMIN"),
    commissionValidator.addCommission.check,
    commissionController.addCommission);

// NOTE: Delete commission
router
  .delete("/:code",
    (req, res, next) => {
      console.log("Delete commission", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType("SERVICE", "SUPER_ADMIN", "ADMIN"),
    commissionValidator.deleteCommission.check,
    commissionController.deleteCommission);

module.exports = router;
