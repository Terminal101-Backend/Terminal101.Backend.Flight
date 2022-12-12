const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class ERefund extends Enum {
  constructor() {
    super(EEnumType.SYMBOLIC);

    this.add("WALLET");
    this.add("CREDIT_CARD");
    this.add("CRYPTO_CURRENCY");

    this.freeze();
  }
}

module.exports = new ERefund();
