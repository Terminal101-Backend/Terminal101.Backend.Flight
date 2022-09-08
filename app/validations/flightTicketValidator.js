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

class GetFlightTicketsView extends BaseValidator {
  constructor() {
    const body = {
    };

    const params = {
      token: Joi.string().required(),
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
  getFlightTicketsView: new GetFlightTicketsView(),
  getUserFlightTickets: new GetUserFlightTickets(),
};
