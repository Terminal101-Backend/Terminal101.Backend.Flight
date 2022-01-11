module.exports = {
  get mongodb() {
    let result = process.env.MONGO_PREFIX + "://";

    if (process.env.MONGO_USERNAME) {
      result += process.env.MONGO_USERNAME;
      if (process.env.MONGO_PASSWORD) {
        result += ":" + process.env.MONGO_PASSWORD + "@";
      }
    }

    result += process.env.MONGO_HOST;

    if (process.env.MONGO_PORT) {
      result += ":" + process.env.MONGO_PORT;
    }

    return result;
  },
  get redis() {
    let result = "redis://";

    if (process.env.REDIS_USERNAME) {
      result += process.env.REDIS_USERNAME;
      if (process.env.REDIS_PASSWORD) {
        result += ":" + process.env.REDIS_PASSWORD + "@";
      }
    }

    result += process.env.REDIS_HOST;

    if (process.env.REDIS_PORT) {
      result += ":" + process.env.REDIS_PORT;
    }

    return result;
  },
};