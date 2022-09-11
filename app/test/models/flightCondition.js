const { expect } = require("@jest/globals");
const repositories = require("../../repositories");

module.exports.addFlightCondition = async (done, vars) => {
  try {
    const flightConditionRepo = repositories.flightConditionRepository;

    const flightCondition = await flightConditionRepo.createFlightCondition({ items: ["IST"] }, { items: ["IKA"] }, { items: ["Turkish Airlines"] });

    vars.id = flightCondition._id;
    vars.code = flightCondition.code;
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.getFlightCondition = async (done, vars) => {
  try {
    const flightConditionRepo = repositories.flightConditionRepository;

    const flightCondition = await flightConditionRepo.getFlightCondition(vars.code);

    vars.flightConditionCode = flightCondition.code;
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.cleanFlightCondition = async (done, vars) => {
  try {
    const flightConditionRepo = repositories.flightConditionRepository;
    await flightConditionRepo.deleteById(vars.id);

    done();
  } catch (err) {
    done(err);
  }
}
