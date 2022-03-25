const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EFlightBook extends Enum {
    constructor() {
        super(EEnumType.SYMBOLIC);

        this.add("INPROGRESS");
        this.add("REFUND");
        this.add("CANCEL");
        this.add("REMOVE");
        this.add("BOOKED");
        this.add("REJECTED");

        this.freeze();
    }
}

module.exports = new EFlightBook();
