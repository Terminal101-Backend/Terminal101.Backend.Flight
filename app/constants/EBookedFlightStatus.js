const Enum = require("../core/enum");
const EEnumType = require("./EEnumType");

class EFlightBook extends Enum {
    constructor() {
        super(EEnumType.SYMBOLIC);

        this.add("PAYING");
        this.add("INPROGRESS");
        this.add("REFUND");
        this.add("REFUND_ACCEPTED");
        this.add("REFUND_CANCEL");
        this.add("REFUND_REJECTED");
        this.add("CANCEL");
        this.add("REMOVE");
        this.add("BOOKED");
        this.add("REJECTED");
        this.add("RESERVED");
        this.add("PAID");
        this.add("BOOK");
        this.add("ERROR");
        this.add("EXPIRED_PAYMENT");

        this.freeze();
    }
}

module.exports = new EFlightBook();
