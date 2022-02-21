const { userRepository, settingRepository } = require("../repositories");
const { EUserType } = require("../constants");
const response = require("../helpers/responseHelper");
const tokenHelper = require("../helpers/tokenHelper");

/**
 * 
 * @param {Object} decodedToken 
 * @param {EUserType} userType 
 * @returns {Promise<Boolean>}
 */
async function checkUserType(decodedToken, userType) {
  let user;
  let userRole;
  switch (decodedToken.user) {
    case "SERVICE":
    case "SUPER_ADMIN":
      userRole = { type: decodedToken.user };
      break;

    default:
      user = await userRepository.findOne({ code: decodedToken.user });
      userRole = user.userRoles.find(userRole => userRole._id.toString() === decodedToken.userRoleId.toString());
  }

  return EUserType.check(userType, userRole.type);
}

exports.isLogin = async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    if (!!decodedToken && !!decodedToken.user) {
      return next();
    }
    return response.error(res, "access denied", 403);
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
    // let user = await userRepository.findById(decodedToken.userId);
    // let userRole = user.userRoles.find(userRole => userRole._id.toString() === decodedToken.userRoleId.toString());

    if (!!decodedToken && await checkUserType(decodedToken, userType)) {
      return next();
    } else {
      return response.error(res, "access denied", 403);
    }
  } catch (e) {
    return response.exception(res, e);
  }
}

exports.checkUserAccess = async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    let permitted = false;

    if (!!decodedToken) {
      permitted = await checkUserType(decodedToken, ["SERVICE", "SUPER_ADMIN"]);

      if (!permitted) {
        permitted = await userRepository.permitted(decodedToken.code, decodedToken.serviceName, decodedToken.userType, req.path, req.method);
      }
    }

    if (!!permitted) {
      return next();
    } else {
      return response.error(res, "access denied", 403);
    }
  } catch (e) {
    return response.exception(res, e);
  }
}

exports.checkUserSettingAccess = async (req, res, next) => {
  try {
    const decodedToken = tokenHelper.decodeToken(req.headers.authorization);
    let permitted = false;

    if (!!decodedToken) {
      permitted = await checkUserType(decodedToken, ["SERVICE", "SUPER_ADMIN"]);

      if (!permitted) {
        const setting = await settingRepository.findOne({ key: req.params.key });
        if (!!setting) {
          const user = await userRepository.findById(decodedToken.userId);
          const userRole = user.userRoles.find(ur => ur._id.toString() === decodedToken.userRoleId.toString());
          permitted = await settingRepository.permitted(setting.key, userRole.serviceName, userRole.type);
        }
      }
    }

    if (!!permitted) {
      return next();
    } else {
      return response.error(res, "access denied", 403);
    }
  } catch (e) {
    return response.exception(res, e);
  }
}