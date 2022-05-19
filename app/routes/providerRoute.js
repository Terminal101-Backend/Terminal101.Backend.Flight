const express = require("express");
const router = express.Router();
const { providerController } = require("../controllers");
const { providerValidator } = require("../validations");

// NOTE: Get all providers
router
  .get("/",
    (req, res, next) => {
      console.log("Get all providers", req.params, req.body, req.query);
      next();
    },
    providerValidator.getProviders.check(),
    providerController.getProviders);

// NOTE: Edit provider
router
  .patch("/:name",
    (req, res, next) => {
      console.log("Edit provider", req.params, req.body, req.query);
      next();
    },
    providerValidator.editProvider.check(),
    providerController.editProvider);

module.exports = router;