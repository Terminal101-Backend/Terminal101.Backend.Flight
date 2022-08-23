const { common } = require("../services");

module.exports.replaceParams = (req, res, next) => {
  req.headers = Object.entries(req.body.headers).reduce((res, [key, value]) => ({ ...res, [key.toLowerCase()]: value }), {});
  req.params = req.body.params;
  req.query = req.body.query;
  req.body = req.body.body;
  next();
};
