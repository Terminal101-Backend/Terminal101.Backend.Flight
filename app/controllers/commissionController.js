const response = require("../helpers/responseHelper");
const { commissionRepository, providerRepository } = require("../repositories");
const { EProvider } = require("../constants");
const { tokenHelper } = require("../helpers");

// NOTE: Commission tickets
// NOTE: Get all business
module.exports.getCommissions = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const providers = await providerRepository.findMany();
    const { items: commissions, ...result } = await commissionRepository.getCommissions(decodedToken.business ?? "ADMIN", req.header("Page"), req.header("PageSize"), req.query.filter, req.query.sort);

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
        // TODO: If user is admin. For businesses users it must be disappear
        business: {
          items: commission.business.items,
          exclude: commission.business.exclude,
        },
        businessCode: commission.businessCode,
        value: {
          percent: commission.value.percent,
          constant: commission.value.constant,
        },
        // TODO: If user is admin. For businesses users it must be disappear
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
      }))
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get one commission
module.exports.getCommission = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const providers = await providerRepository.findMany();
    const commission = await commissionRepository.getCommission(decodedToken.business ?? "ADMIN", req.params.code);

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
      // TODO: If user is admin. For businesses users it must be disappear
      business: {
        items: commission.business.items,
        exclude: commission.business.exclude,
      },
      businessCode: commission.businessCode,
      value: {
        percent: commission.value.percent,
        constant: commission.value.constant,
      },
      // TODO: If user is admin. For businesses users it must be disappear
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
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Edit commission
module.exports.editCommission = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    let modified = false;

    const commission = await commissionRepository.findOne({ businessCode: decodedToken.business ?? 'ADMIN', code: req.params.code });
    if (!commission) {
      response.error(res, "commission_not_exists", 404);
    }

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

    if (!!req.body.business && (JSON.stringify(commission.business) !== JSON.stringify(req.body.business))) {
      commission.business = req.body.business;
      modified = true;
    }

    if (!!req.body.value && (JSON.stringify(commission.value) !== JSON.stringify(req.body.value))) {
      if (!!req.body.value.percent) {
        commission.value.percent = req.body.value.percent;
      }
      if (!!req.body.value.constant) {
        commission.value.constant = req.body.value.constant;
      }
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
      // TODO: If user is admin. For businesses users it must be disappear
      business: {
        items: commission.business.items,
        exclude: commission.business.exclude,
      },
      businessCode: commission.businessCode,
      value: {
        percent: commission.value.percent,
        constant: commission.value.constant,
      },
      // TODO: If user is admin. For businesses users it must be disappear
      providerNames: commission.providerNames,
      isActive: commission.isActive,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Delete commission
module.exports.deleteCommission = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    const commission = await commissionRepository.deleteOne({ businessCode: decodedToken.business ?? 'ADMIN', code: req.params.code });
    if (!commission) {
      response.error(res, "commission_not_exists", 404);
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
      // TODO: If user is admin. For businesses users it must be disappear
      business: {
        items: commission.business.items,
        exclude: commission.business.exclude,
      },
      businessCode: commission.businessCode,
      value: {
        percent: commission.value.percent,
        constant: commission.value.constant,
      },
      // TODO: If user is admin. For businesses users it must be disappear
      providerNames: commission.providerNames,
      isActive: commission.isActive,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Add flight dondition
module.exports.addCommission = async (req, res) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.header("Authorization"));
    if (decodedToken.type === 'BUSINESS') {
      if (req.body.business.items.length === 0 && !req.body.business.exclude) {
        throw 'Information not entered correctly';
      }
    }
    const commission = await commissionRepository.createCommission(req.body.origin, req.body.destination, req.body.airline, req.body.providerNames, req.body.business, decodedToken.business, req.body.value);

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
      // TODO: If user is admin. For businesses users it must be disappear
      business: {
        items: commission.business.items,
        exclude: commission.business.exclude,
      },
      businessCode: commission.businessCode,
      value: {
        percent: commission.value.percent,
        constant: commission.value.constant,
      },
      // TODO: If user is admin. For businesses users it must be disappear
      providerNames: commission.providerNames,
      isActive: commission.isActive,
    });
  } catch (e) {
    response.exception(res, e);
  }
};
