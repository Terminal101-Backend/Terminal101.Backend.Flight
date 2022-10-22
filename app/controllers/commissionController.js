const response = require("../helpers/responseHelper");
const { commissionRepository, providerRepository } = require("../repositories");
const { EProvider } = require("../constants");

// NOTE: Commission tickets
// NOTE: Get all commissions
module.exports.getCommissions = async (req, res) => {
  try {
    const providers = await providerRepository.findMany();
    const { items: commissions, ...result } = await commissionRepository.getCommissions(req.header("Page"), req.header("PageSize"), req.query.filter, req.query.sort);

    response.success(res, {
      ...result,
      items: commissions.map(commission => ({
        code: commission.code,
        origin: {
          items: commission.origin.items,
          exclude: commission.origin.exclude,
        },
        destination: {
          items: commission.destination.items,
          exclude: commission.destination.exclude,
        },
        airline: {
          items: commission.airline.items,
          exclude: commission.airline.exclude,
        },
        providerNames: commission.providerNames.map(providerName => {
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
        isActive: commission.isActive,
        isRestricted: commission.isRestricted,
      }))
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get one commission
module.exports.getCommission = async (req, res) => {
  try {
    const providers = await providerRepository.findMany();
    const commission = await commissionRepository.getCommission(req.params.code);

    if (!commission) {
      throw "condition_not_found";
    }

    response.success(res, {
      code: commission.code,
      origin: {
        items: commission.origin.items,
        exclude: commission.origin.exclude,
      },
      destination: {
        items: commission.destination.items,
        exclude: commission.destination.exclude,
      },
      airline: {
        items: commission.airline.items,
        exclude: commission.airline.exclude,
      },
      providerNames: commission.providerNames.map(providerName => {
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
      isActive: commission.isActive,
      isRestricted: commission.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Edit commission
module.exports.editCommission = async (req, res) => {
  try {
    let modified = false;

    const commission = await commissionRepository.findOne({ code: req.params.code });
    if (!!req.body.origin && ((commission.origin.exclude !== req.body.origin.exclude) || (JSON.stringify(commission.origin.items) !== JSON.stringify(req.body.origin.items)))) {
      commission.origin = req.body.origin;
      modified = true;
    }

    if (!!req.body.destination && ((commission.destination.exclude !== req.body.destination.exclude) || (JSON.stringify(commission.destination.items) !== JSON.stringify(req.body.destination.items)))) {
      commission.destination = req.body.destination;
      modified = true;
    }

    if (!!req.body.airline && ((commission.airline.exclude !== req.body.airline.exclude) || (JSON.stringify(commission.airline.items) !== JSON.stringify(req.body.airline.items)))) {
      commission.airline = req.body.airline;
      modified = true;
    }

    if (!!req.body.providerNames && (JSON.stringify(commission.providerNames) !== JSON.stringify(req.body.providerNames))) {
      commission.providerNames = req.body.providerNames;
      modified = true;
    }

    if (!!req.body.commissions && (JSON.stringify(commission.commissions) !== JSON.stringify(req.body.commissions))) {
      commission.commissions = req.body.commissions;
      modified = true;
    }

    if ((req.body.isRestricted !== undefined) && (commission.isRestricted !== req.body.isRestricted)) {
      commission.isRestricted = req.body.isRestricted;
      modified = true;
    }

    if ((req.body.isActive !== undefined) && (commission.isActive !== req.body.isActive)) {
      commission.isActive = req.body.isActive;
      modified = true;
    }

    if (!!modified) {
      await commission.save();
    }

    response.success(res, {
      code: commission.code,
      origin: {
        items: commission.origin.items,
        exclude: commission.origin.exclude,
      },
      destination: {
        items: commission.destination.items,
        exclude: commission.destination.exclude,
      },
      airline: {
        items: commission.airline.items,
        exclude: commission.airline.exclude,
      },
      providerNames: commission.providerNames,
      isActive: commission.isActive,
      isRestricted: commission.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Delete commission
module.exports.deleteCommission = async (req, res) => {
  try {
    const commission = await commissionRepository.deleteOne({ code: req.params.code });

    !!commission ?
      response.success(res, {
        code: commission.code,
        origin: {
          items: commission.origin.items,
          exclude: commission.origin.exclude,
        },
        destination: {
          items: commission.destination.items,
          exclude: commission.destination.exclude,
        },
        airline: {
          items: commission.airline.items,
          exclude: commission.airline.exclude,
        },
        providerNames: commission.providerNames,
        isActive: commission.isActive,
        isRestricted: commission.isRestricted,
      }) :
      response.exception(res, 'condition_not_exist');
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Add flight dondition
module.exports.addCommission = async (req, res) => {
  try {
    const commission = await commissionRepository.createCommission(req.body.origin, req.body.destination, req.body.airline, req.body.providerNames, req.body.commissions, req.body.isRestricted);

    response.success(res, {
      code: commission.code,
      origin: {
        items: commission.origin.items,
        exclude: commission.origin.exclude,
      },
      destination: {
        items: commission.destination.items,
        exclude: commission.destination.exclude,
      },
      airline: {
        items: commission.airline.items,
        exclude: commission.airline.exclude,
      },
      providerNames: commission.providerNames,
      isActive: commission.isActive,
      isRestricted: commission.isRestricted,
    });
  } catch (e) {
    response.exception(res, e);
  }
};
