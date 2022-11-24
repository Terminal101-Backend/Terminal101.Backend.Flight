const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EBadgeType extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("CHARTER");
    this.add("INSTANT_PURCHASE");

    this.freeze();
  }
}

module.exports = new EBadgeType();