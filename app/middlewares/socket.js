const { common } = require("../services");

module.exports.replaceParams = (req, res, next) => {
  req.headers = {
    ...req.headers,
    ...Object.entries(req.body.headers ?? {}).reduce((res, [key, value]) => ({ ...res, [key.toLowerCase()]: value }), {})
  };
  req.body = req.body.body ?? {};
  next();
};
