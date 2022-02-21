const jwt = require("jsonwebtoken");

exports.newToken = json => {
  return jwt.sign(json,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRE
    }
  );
}

exports.decodeToken = token => {
  if (!!token && /^Bearer [\.\w]+/.test(token)) {
    token = token.substr("Bearer ".length);
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}


