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
    checkAccess.checkUserType(["THIRD_PARTY"]),
    checkAccess.checkUserAccess,
    thirdPartyValidator.lowFareSearch.check(),
    thirdPartyController.lowFareSearch);

// NOTE: Book
router
  .post("/book",
    (req, res, next) => {
      console.log("Search flights", req.params, req.body, req.query);
      next();
    },
    checkAccess.checkUserType(["THIRD_PARTY"]),
    // checkAccess.checkUserAccess,
    thirdPartyValidator.book.check(),
    thirdPartyController.book);

module.exports = router;
