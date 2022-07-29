const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EFlightBook extends Enum {
    constructor() {
        super(EEnumType.SYMBOLIC);

        this.add("PAYING");
        this.add("INPROGRESS");
        this.add("REFUND_REQUEST");
        this.add("REFUND_ACCEPTED");
        this.add("REFUND_CANCEL");
        this.add("|REFUND_REJECTED");
        this.add("CANCEL");
        this.add("REMOVE");
        this.add("BOOKED");
        this.add("REJECTED");

        this.freeze();
    }
}

module.exports = new EFlightBook();
