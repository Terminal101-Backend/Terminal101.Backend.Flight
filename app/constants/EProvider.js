const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EProvider extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("AMADEUS");
    this.add("PARTO");

    this.freeze();
  }
}

module.exports = new EProvider();
