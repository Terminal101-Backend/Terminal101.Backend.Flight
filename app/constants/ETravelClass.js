const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EFlightWaypoint extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("DEEP_DISCOUNTED");
    this.add("ECONOMY");
    this.add("PERMIUM_ECONOMY");
    this.add("BUSINESS");
    this.add("FIRST");

    this.freeze();
  }
}

module.exports = new EFlightWaypoint();
