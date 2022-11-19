const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class ECategory extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("YEAR");
    this.add("MONTH");
    this.add("DAY");

    this.freeze();
  }
}

module.exports = new ECategory();
