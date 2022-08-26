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
  token = token.replace(/^bearer\s*/i, "");
  return !!token ? jwt.verify(token, process.env.JWT_SECRET) : undefined;
}
