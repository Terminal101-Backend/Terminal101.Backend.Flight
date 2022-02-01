const emailRegex = /\w+@\w+\.\w+/;
const mobileRegex = /.*/;

module.exports.generateRandomString = (minLength = 3, maxLength = 10, useNumbers = true, useLowerCases = true, useUpperCases = true) => {
  let result = "";

  const length = minLength + Math.ceil(Math.random() * (maxLength - minLength));

  const possibles = ((useNumbers ? 10 : 0) + (useLowerCases ? 26 : 0) + (useUpperCases ? 26 : 0)) - 1;

  let chars = "";
  if (!!useNumbers) {
    chars += Array(10).fill("0", 0, 10).map((item, index) => index.toString()).join("");
  }
  if (!!useLowerCases) {
    chars += Array(26).fill("a", 0, 26).map((item, index) => String.fromCharCode(item.charCodeAt(0) + index)).join("");
  }
  if (!!useUpperCases) {
    chars += Array(26).fill("A", 0, 26).map((item, index) => String.fromCharCode(item.charCodeAt(0) + index)).join("");
  }

  if (!!useNumbers || !!useLowerCases || !!useUpperCases) {
    for (let i = 0; i < length; i++) {
      const charIndex = Math.floor(Math.random() * possibles);
      // const charIndex = Math.ceil(Math.random() * possibles - (!!useNumbers ? 1 : 0) - (!!useLowerCases ? 1 : 0) - (!!useUpperCases ? 1 : 0));

      result += chars[charIndex];
    }
  }

  return result;
};

module.exports.emailRegex = emailRegex;
module.exports.mobileRegex = mobileRegex;

module.exports.isEmail = str => {
  return emailRegex.test(str);
};

module.exports.isMobileNumber = str => {
  return mobileRegex.test(str);
};
