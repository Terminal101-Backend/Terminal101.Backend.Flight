const { Joi } = require("celebrate");

const { BaseValidator } = require("../core");

class GetFlightTickets extends BaseValidator {
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

class GetFlightTicketsPdf extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      bookedBy: Joi.string().required(),
      bookedFlightCode: Joi.string().required(),
    };

    super(body);
    this.params(params);
  }
};

class GetUserFlightTickets extends BaseValidator {
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

module.exports = {
  getFlightTickets: new GetFlightTickets(),
  getFlightTicketsPdf: new GetFlightTicketsPdf(),
  getUserFlightTickets: new GetUserFlightTickets(),
};
