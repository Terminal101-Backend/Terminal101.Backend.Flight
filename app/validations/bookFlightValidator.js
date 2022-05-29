const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class BookFlight extends BaseValidator {
  constructor() {
    const body = {
      searchedFlightCode: Joi.string().required(),
      flightDetailsCode: Joi.number().required(),
      paymentMethodName: Joi.string().required(),
      payWay: Joi.string().pattern(/^WALLET|PAY$/).default("PAY"),
      leader: Joi.object({
        documentCode: Joi.string().required(),
        documentIssuedAt: Joi.string().required(),
      }),
      passengers: Joi.array().items(Joi.object({
        documentCode: Joi.string().required(),
        documentIssuedAt: Joi.string().required(),
      })).default([]),
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
  getBookedFlights: new GetBookedFlights(),
  getUserBookedFlights: new GetUserBookedFlights(),
  getBookedFlight: new GetBookedFlight(),
  getUserBookedFlight: new GetUserBookedFlight(),
  payForFlight: new PayForFlight(),
};
