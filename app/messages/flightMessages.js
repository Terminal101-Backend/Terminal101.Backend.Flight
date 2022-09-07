const {router} = require("../helpers/socketHelper");
const {flightValidator} = require("../validations");
const {flightController} = require("../controllers");

// NOTE: Search flight origin/destination
router
  .use("/search",
    (req, res, next) => {
      console.log("Search flight", req.params, req.body, req.query);
      next();
    },
    flightValidator.searchFlights.check,
    flightController.searchFlights);

module.exports = router;
