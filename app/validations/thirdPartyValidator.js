const { Joi } = require("celebrate");
const { baseValidator } = require("../core");
const { ETravelClass } = require("../constants");

module.exports.lowFareSearch = baseValidator({
  body: {},
  params: {
    0: Joi.string().allow(null, ""),
  },
  query: {
    origin: Joi.string().required(),
    destination: Joi.string().required(),
    departureDate: Joi.date().required(),
    returnDate: Joi.date(),
    adults: Joi.number().default(1),
    children: Joi.number(),
    infants: Joi.number(),
    travelClass: ETravelClass.validator({ default: "ECONOMY" }),
    segments: [
      Joi.string(),
      Joi.array().items(Joi.string()),
    ],
  },
});

module.exports.book = baseValidator({
  body: {
    searchedFlightCode: Joi.string().required(),
    flightDetailsCode: Joi.string().required(),
    contact: Joi.object().keys({
      email: Joi.string().email(),
      mobileNumber: Joi.string(),
    }),
    passengers: Joi.array().items(Joi.object().keys({
      gender: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      birthDate: Joi.date().required(),
      nickName: Joi.string().allow(null, ""),
      middleName: Joi.string().allow(null, ""),
      document: Joi.object().required().keys({
        type: Joi.string(),
        code: Joi.string().required(),
        issuedAt: Joi.string().required(),
        expirationDate: Joi.date().required(),
        postCode: Joi.string(),
      }),
    })).min(1)
  },
  params: {
    0: Joi.string().allow(null, ""),
  },
});

module.exports.readBook = baseValidator({
  body: {},
  params: {
    bookedId: Joi.string().required(),
    0: Joi.string().allow(null, ""),
  },
});

module.exports.availableRoutes = baseValidator({
  body: {},
  params: {
    0: Joi.string().allow(null, ""),
  },
});

module.exports.calendarAvailability = baseValidator({
  body: {},
  params: {
    0: Joi.string().allow(null, ""),
  },
  query: {
    origin: Joi.string().required(),
    destination: Joi.string().required(),
    start: Joi.date().required(),
    end: Joi.date().required(),
  },
});

module.exports.airAvailable = baseValidator({
  body: {},
  params: {
    0: Joi.string().allow(null, ""),
  },
  query: {
    origin: Joi.string().required(),
    destination: Joi.string().required(),
    departureDate: Joi.date().required(),
    travelClass: ETravelClass.validator({ default: "ECONOMY" }),
  },
});

module.exports.airPrice = baseValidator({
  body: {},
  params: {
    searchedFlightCode: Joi.string().required(),
    flightDetailsCode: Joi.string().required(),
    0: Joi.string().allow(null, ""),
  },
  query: {
    adults: Joi.number().default(1),
    children: Joi.number(),
    infants: Joi.number()
  },
});

module.exports.ticketDemand = baseValidator({
  body: {},
  params: {
    bookedId: Joi.string().required(),
    0: Joi.string().allow(null, ""),
  },
});

module.exports.cancelBook = baseValidator({
  body: {},
  params: {
    bookedId: Joi.string().required(),
    0: Joi.string().allow(null, ""),
  },
});
