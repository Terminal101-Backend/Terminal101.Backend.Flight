const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EFlightWaypoint extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("SUPPLIER");
    this.add("TICKETING");
    this.add("FORM_OF_PAYMENT");
    this.add("COMMISSION");

    this.freeze();
  }
}

module.exports = new EFlightWaypoint();
