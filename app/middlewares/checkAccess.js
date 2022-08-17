const { EUserType } = require("../constants");
const response = require("../helpers/responseHelper");
const tokenHelper = require("../helpers/tokenHelper");
const { accountManagement } = require("../services");

exports.isLogin = async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    if (!!decodedToken && !!decodedToken.user) {
      return next();
    }
    return response.error(res, "access_denied", 403);
  } catch (e) {
    return response.exception(res, e);
  }
}

/**
 * 
 * @param {EUserType} userType 
 * @returns 
 */
exports.checkUserType = (userType = "CLIENT") => async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    if (!!decodedToken && EUserType.check(userType, decodedToken.type)) {
      return next();
    } else {
      return response.error(res, "access_denied", 403);
    }
  } catch (e) {
    return response.exception(res, e);
  }
}

exports.checkUserAccess = async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    const path = req.originalUrl.split("?")[0];
    const testMode = req.params[0] === "/test";
    if (!!decodedToken && await accountManagement.checkUserAccess(decodedToken.user, decodedToken.type, decodedToken.service, req.method, path, req.header("Username"), testMode)) {
      return next();
    } else {
      return response.error(res, "access_denied", 403);
    }
  } catch (e) {
    return response.exception(res, e);
  }
}
