const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

// module.exports = Object.freeze({
//   SUPER_ADMIN: Symbol("super_admin"),
//   ADMIN: Symbol("admin"),
//   BUSINESS: Symbol("business"),
//   CLIENT: Symbol("client"),
// });

class EUserType extends Enum {
  constructor() {
    super(EEnumType.NUMERIC);

    this.add("SERVICE");
    this.add("SUPER_ADMIN");
    this.add("ADMIN");
    this.add("BUSINESS");
    this.add("CLIENT");

    this.freeze();
  }
}

module.exports = new EUserType();
