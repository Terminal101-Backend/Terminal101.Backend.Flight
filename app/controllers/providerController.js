const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { providerRepository } = require("../repositories");
const { EProvider } = require("../constants");
const { decodeToken } = require("../helpers/tokenHelper");
const { accountManagement } = require("../services");

// NOTE: Provider tickets
// NOTE: Get all provider
module.exports.getProviders = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.header("Authorization"));
    let providers = await providerRepository.findMany();

    if (decodedToken.type === "BUSINESS") {
      const { data: availableProviders } = await accountManagement.getThirdPartyUserAvailableProviders(decodedToken.user, decodedToken.business);
      providers = providers.filter(provider => availableProviders.includes(EProvider.find(provider.name)));
    }

    response.success(res, providers.map(provider => ({
      name: EProvider.find(provider.name),
      title: provider.title,
      isActive: provider.isActive,
    })));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Edit provider
module.exports.editProvider = async (req, res) => {
  try {
    let modified = false;

    const provider = await providerRepository.findOne({ name: req.params.name });
    if (!!req.body.title && (provider.title !== req.body.title)) {
      provider.title = req.body.title;
      modified = true;
    }

    if ((req.body.isActive !== undefined) && (provider.isActive !== req.body.isActive)) {
      provider.isActive = req.body.isActive;
      modified = true;
    }

    if (!!modified) {
      await provider.save();
    }

    response.success(res, {
      name: EProvider.find(provider.name),
      title: provider.title,
      isActive: provider.isActive,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Delete provider
module.exports.deleteProvider = async (req, res) => {
  try {
    const provider = await providerRepository.deleteOne({ name: req.params.name });

    response.success(res, {
      name: EProvider.find(provider.name),
      title: provider.title,
      isActive: provider.isActive,
    });
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Add provider
module.exports.addProvider = async (req, res) => {
  try {
    const provider = await providerRepository.createProvider(req.body.name, req.body.title, req.body.isActive);

    response.success(res, {
      name: EProvider.find(provider.name),
      title: provider.title,
      isActive: provider.isActive,
    });
  } catch (e) {
    response.exception(res, e);
  }
};
