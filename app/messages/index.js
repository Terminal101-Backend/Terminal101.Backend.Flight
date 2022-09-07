const {router} = require("../helpers/socketHelper");

router.use("/flight", require("./flightMessages"));

module.exports = router;
