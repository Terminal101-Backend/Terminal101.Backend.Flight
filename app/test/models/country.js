const { expect } = require("@jest/globals");
const repositories = require("../../repositories");

module.exports.addCountry = async (done, vars) => {
  try {
    const countryRepo = repositories.countryRepository;

    const country = await countryRepo.createCountry("Merrikh", "MRKH");

    vars.id = country._id;
    vars.code = country.code;
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.addCity = async (done, vars) => {
  try {
    const countryRepo = repositories.countryRepository;

    const city = await countryRepo.addCity(vars.code, "Merrikh City", "MRCT");

    vars.cityCode = city.code;
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.addAirport = async (done, vars) => {
  try {
    const countryRepo = repositories.countryRepository;

    await countryRepo.addAirport(vars.code, vars.cityCode, "Merrikh airport", "MRAP", "Mars international airport", { latitude: 10, longitude: 20 });

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.addAirline = async (done, vars) => {
  try {
    const countryRepo = repositories.countryRepository;

    await countryRepo.addAirline(vars.code, "Merrikh Peymaa", "MRPY", "Merrikh airline", { latitude: 20, longitude: 30 });

    done();
  } catch (err) {
    done(err);
  }
};

module.exports.cleanCountry = async (done, vars) => {
  try {
    const countryRepo = repositories.countryRepository;

    console.log(vars);
    await countryRepo.deleteById(vars.id);

    done();
  } catch (err) {
    done(err);
  }
}
