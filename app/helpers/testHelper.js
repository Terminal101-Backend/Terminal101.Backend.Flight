module.exports.check = (done, ...states) => {
  const checkNext = state => {
    if (isNaN(state)) {
      // NOTE: Return error
      done(state);
    } else {
      const caller = () => {
        if (!!states[state].test) {
          const params = !!states[state].params ? states[state].params : [];
          states[state++].test(checkNext(state), ...params);
        } else {
          states[state++](checkNext(state));
        }
      };

      if (state === 0) {
        caller();
      } else if (state < states.length) {
        return caller;
      } else {
        return done;
      }
    }
  }

  checkNext(0);
}

module.exports.generateRandomString = (minLength = 3, maxLength = 10, useNumbers = true, useLowerCases = true, useUpperCases = true) => {
  let result = "";

  const length = minLength + Math.ceil(Math.random() * (maxLength - minLength));

  const possibles = ((useNumbers ? 10 : 0) + (useLowerCases ? 26 : 0) + (useUpperCases ? 26 : 0));

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
      const charIndex = Math.ceil(Math.random() * possibles - (!!useNumbers ? 1 : 0) - (!!useLowerCases ? 1 : 0) - (!!useUpperCases ? 1 : 0));

      result += chars[charIndex];
    }
  }

  return result;
};
