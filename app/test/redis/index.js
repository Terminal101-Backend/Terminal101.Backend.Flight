const redis = require("../../core/db/redis");

module.exports = {
};

module.exports.connect = async done => {
  try {
    await redis.startDatabase();
    done();
  } catch (e) {
    done(e);
  }
};

module.exports.disconnect = async done => {
  try {
    await redis.stopDatabase();
    done();
  } catch (e) {
    done(e);
  }
};
