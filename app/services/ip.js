const axios = require("axios");

module.exports.getIpInfo = async (ip) => {
  const { data: response } = await axios.get(eval(`\`${process.env.IP_API_URL}\``));

  return response;
};
