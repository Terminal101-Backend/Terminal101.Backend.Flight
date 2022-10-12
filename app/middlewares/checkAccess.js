const { EUserType } = require("../constants");
const response = require("../helpers/responseHelper");
const tokenHelper = require("../helpers/tokenHelper");
const { accountManagement } = require("../services");

exports.isLogin = async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    if (!decodedToken) {
      throw "access_denied";
    }
    if (!!decodedToken.user) {
      return next();
    }
    return response.error(res, "access_denied", 401);
  } catch (e) {
    return response.error(res, "access_denied", 401);
  }
}

/**
 * 
 * @param {EUserType} userType 
 * @returns 
 */
exports.checkUserType = (...userType) => async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    if (!decodedToken) {
      throw "access_denied";
    }
    if (EUserType.check(userType, decodedToken.type)) {
      return next();
    } else {
      return response.error(res, "access_denied", 403);
    }
  } catch (e) {
    return response.error(res, "access_denied", 401);
  }
}

exports.checkUserAccess = async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    const path = req.originalUrl.split("?")[0];
    const testMode = req.params[0] === "/test";
    if (!decodedToken) {
      throw "access_denied";
    }
    console.log(await accountManagement.checkUserAccess(decodedToken.user, decodedToken.type, decodedToken.service, req.method, path, req.header("Username"), testMode));

    if (await accountManagement.checkUserAccess(decodedToken.user, decodedToken.type, decodedToken.service, req.method, path, req.header("Username"), testMode)) {
      console.log(2222222222)
      return next();
    } else {
      console.log(333333333)
      return response.error(res, "access_denied", 403);
    }
  } catch (e) {
    console.log(44444444)
    return response.error(res, "access_denied", 401);
  }
}
