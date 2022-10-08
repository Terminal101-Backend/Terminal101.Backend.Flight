const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EFlightWaypoint extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("ADULT");
    this.add("CHILD");
    this.add("INFANT");

    this.freeze();
  }
}

module.exports = new EFlightWaypoint();
