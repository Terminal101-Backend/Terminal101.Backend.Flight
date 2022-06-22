const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { flightConditionRepository } = require("../repositories");
const { EFlightCondition } = require("../constants");

// NOTE: FlightCondition tickets
// NOTE: Get all flight conditions
module.exports.getFlightConditions = async (req, res) => {
  try {
    const { items: flightConditions, ...result } = await flightConditionRepository.getFlightConditions(req.header("Page"), req.header("PageSize"));

    response.success(res, {
      ...result,
      items: flightConditions.map(flightCondition => ({
        origin: {
          items: flightCondition.origin.items,
          exclude: flightCondition.origin.exculude,
        },
        destination: {
          items: flightCondition.destination.items,
          exclude: flightCondition.destination.exculude,
        },
        airline: {
          items: flightCondition.airline.items,
          exclude: flightCondition.airline.exculude,
        },
        providerNames: flightCondition.providerNames,
        isRestricted: flightCondition.isRestricted,
      }))
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get one flight condition
module.exports.getFlightCondition = async (req, res) => {
  try {
    const flightConditions = await flightConditionRepository.getFlightCondition(req.params.code);

    response.success(res, {
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exculude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exculude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exculude,
      },
      providerNames: flightCondition.providerNames,
      isRestricted: flightCondition.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Edit flight condition
module.exports.editFlightCondition = async (req, res) => {
  try {
    let modified = false;

    const flightCondition = await flightConditionRepository.findOne({ code: req.params.code });
    if (!!req.body.origin && ((flightCondition.origin.exclude !== req.body.origin.exclude) || (JSON.stringify(flightCondition.origin.items) !== JSON.stringify(req.body.origin.items)))) {
      flightCondition.origin = req.body.origin;
      modified = true;
    }

    if (!!req.body.destination && ((flightCondition.destination.exclude !== req.body.destination.exclude) || (JSON.stringify(flightCondition.destination.items) !== JSON.stringify(req.body.destination.items)))) {
      flightCondition.destination = req.body.destination;
      modified = true;
    }

    if (!!req.body.airline && ((flightCondition.airline.exclude !== req.body.airline.exclude) || (JSON.stringify(flightCondition.airline.items) !== JSON.stringify(req.body.airline.items)))) {
      flightCondition.airline = req.body.airline;
      modified = true;
    }

    if (!!req.body.providerNames && (JSON.stringify(flightCondition.providerNames) !== JSON.stringify(req.body.providerNames))) {
      flightCondition.providerNames = req.body.providerNames;
      modified = true;
    }

    if ((req.body.isRestricted !== undefined) && (flightCondition.isRestricted !== req.body.isRestricted)) {
      flightCondition.isRestricted = req.body.isRestricted;
      modified = true;
    }

    if (!!modified) {
      await flightCondition.save();
    }

    response.success(res, {
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exculude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exculude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exculude,
      },
      providerNames: flightCondition.providerNames,
      isRestricted: flightCondition.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Delete flight condition
module.exports.deleteFlightCondition = async (req, res) => {
  try {
    const flightCondition = await flightConditionRepository.deleteOne({ code: req.params.code });

    response.success(res, {
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exculude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exculude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exculude,
      },
      providerNames: flightCondition.providerNames,
      isRestricted: flightCondition.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Add flight dondition
module.exports.addFlightCondition = async (req, res) => {
  try {
    const flightCondition = await flightConditionRepository.createFlightCondition(req.body.origin, req.body.destination, req.body.airline, req.body.providerNames, req.body.isRestricted);

    response.success(res, {
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exculude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exculude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exculude,
      },
      providerNames: flightCondition.providerNames,
      isRestricted: flightCondition.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};
