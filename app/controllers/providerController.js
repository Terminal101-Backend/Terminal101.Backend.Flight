const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const { providerRepository } = require("../repositories");

// NOTE: Provider tickets
// NOTE: Get all provider
module.exports.getProviders = async (req, res) => {
  try {
    const providers = await providerRepository.findMany();

    response.success(res, providers.map(provider => ({
      name: provider.name,
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
      name: provider.name,
      title: provider.title,
      isActive: provider.isActive,
    });
  } catch (e) {
    response.exception(res, e);
  }
};
