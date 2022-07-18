const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { flightConditionRepository, providerRepository } = require("../repositories");
const { EProvider } = require("../constants");

// NOTE: FlightCondition tickets
// NOTE: Get all flight conditions
module.exports.getFlightConditions = async (req, res) => {
  try {
    const providers = await providerRepository.findMany();
    const { items: flightConditions, ...result } = await flightConditionRepository.getFlightConditions(req.header("Page"), req.header("PageSize"));

    response.success(res, {
      ...result,
      items: flightConditions.map(flightCondition => ({
        code: flightCondition.code,
        origin: {
          items: flightCondition.origin.items,
          exclude: flightCondition.origin.exclude,
        },
        destination: {
          items: flightCondition.destination.items,
          exclude: flightCondition.destination.exclude,
        },
        airline: {
          items: flightCondition.airline.items,
          exclude: flightCondition.airline.exclude,
        },
        providerNames: flightCondition.providerNames.map(providerName => {
          const provider = providers.find(p => EProvider.check(p.name, providerName));
          if (!provider) {
            return undefined;
          }
          return {
            name: providerName,
            title: provider.title,
            isActive: provider.isActive,
          }
        }).filter(provider => !!provider),
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
    const providers = await providerRepository.findMany();
    const flightCondition = await flightConditionRepository.getFlightCondition(req.params.code);

    if (!flightCondition) {
      throw "condition_not_found";
    }

    response.success(res, {
      code: flightCondition.code,
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exclude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exclude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exclude,
      },
      providerNames: flightCondition.providerNames.map(providerName => {
        const provider = providers.find(p => EProvider.check(p.name, providerName));
        if (!provider) {
          return undefined;
        }
        return {
          name: providerName,
          title: provider.title,
          isActive: provider.isActive,
        }
      }).filter(provider => !!provider),
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
      code: flightCondition.code,
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exclude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exclude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exclude,
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
      code: flightCondition.code,
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exclude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exclude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exclude,
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
      code: flightCondition.code,
      origin: {
        items: flightCondition.origin.items,
        exclude: flightCondition.origin.exclude,
      },
      destination: {
        items: flightCondition.destination.items,
        exclude: flightCondition.destination.exclude,
      },
      airline: {
        items: flightCondition.airline.items,
        exclude: flightCondition.airline.exclude,
      },
      providerNames: flightCondition.providerNames,
      isRestricted: flightCondition.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};
