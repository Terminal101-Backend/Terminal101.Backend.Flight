const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class BookFlight extends BaseValidator {
  constructor() {
    const body = {
      searchedFlightCode: Joi.string().required(),
      flightDetailsCode: Joi.string().required(),
      paymentMethodName: Joi.string().required(),
      currencySource: Joi.string(),
      currencyTarget: Joi.string(),
      // payWay: Joi.string().pattern(/^WALLET|PAY$/).default("PAY"),
      useWallet: Joi.boolean().default(false),
      contact: Joi.object({
        email: Joi.string().required(),
        mobileNumber: Joi.string().required(),
      }).required(),
      passengers: Joi.array().items(Joi.object({
        documentCode: Joi.string().required(),
        documentIssuedAt: Joi.string().required(),
      })).min(1).required(),
    };

    super(body);
  }
};

class BookFlightForUser extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      userCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class EditUserBookedFlight extends BaseValidator {
  constructor() {
    const body = {
      contact: Joi.object({
        email: Joi.string(),
        mobileNumber: Joi.string(),
      }),
      passengers: Joi.array().items(Joi.object({
        documentCode: Joi.string().required(),
        documentIssuedAt: Joi.string().required(),
      })).min(1).required(),
      // removePassengers: Joi.array().items(Joi.object({
      //   documentCode: Joi.string().required(),
      //   documentIssuedAt: Joi.string().required(),
      // })),
      status: Joi.string().regex(/PAYING|INPROGRESS|REFUND_REQUEST|REFUND_ACCEPTED|REFUND_CANCEL|REFUND_REJECTED|CANCEL|REMOVE|BOOKED|REJECTED/),
      description: Joi.string().default(""),
    };

    const params = {
      userCode: Joi.string().required(),
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetBookedFlights extends BaseValidator {
  constructor() {
    const body = {
    };

    super(body);
  }
};

class GetUserBookedFlights extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      userCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class CancelBookedFlight extends BaseValidator {
  constructor() {
    const body = {
      description: Joi.string().required(),
      refundTo: Joi.string().required().regex(/WALLET|CREDIT_CARD|CRYPTO_CURRENCY/),
      refundInfo: Joi.string().required(),
    };

    const params = {
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GenerateNewPaymentInfo extends BaseValidator {
  constructor() {
    const body = {
      paymentMethodName: Joi.string().required(),
      // payWay: Joi.string().pattern(/^WALLET|PAY$/).default("PAY"),
      useWallet: Joi.boolean().default(false),
      currencySource: Joi.string(),
      currencyTarget: Joi.string(),
    };

    const params = {
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetBookedFlightStatus extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetUserBookedFlightStatus extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      userCode: Joi.string().required(),
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetBookedFlight extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetUserBookedFlight extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      userCode: Joi.string().required(),
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class PayForFlight extends BaseValidator {
  constructor() {
    const body = {
      userCode: Joi.string().required(),
      externalTransactionId: Joi.string().required(),
      confirmed: Joi.boolean().required(),
    };

    super(body);
  }
};

module.exports = {
  bookFlight: new BookFlight(),
  bookFlightForUser: new BookFlightForUser(),
  editUserBookedFlight: new EditUserBookedFlight(),
  cancelBookedFlight: new CancelBookedFlight(),
  getBookedFlights: new GetBookedFlights(),
  getUserBookedFlights: new GetUserBookedFlights(),
  getBookedFlight: new GetBookedFlight(),
  getUserBookedFlightStatus: new GetUserBookedFlightStatus(),
  getBookedFlightStatus: new GetBookedFlightStatus(),
  generateNewPaymentInfo: new GenerateNewPaymentInfo(),
  getUserBookedFlight: new GetUserBookedFlight(),
  payForFlight: new PayForFlight(),
};
