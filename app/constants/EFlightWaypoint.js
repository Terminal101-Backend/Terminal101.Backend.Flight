const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EFlightWaypoint extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("ORIGIN");
    this.add("DESTINATION");

    this.freeze();
  }
}

module.exports = new EFlightWaypoint();
