const axios = require("axios");
const axiosApiInstance = axios.create();
const accountManagement = require("./accountManagement");

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.COMMON_SERVICE_URL;
    config.headers = {
      'Accept': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/json',
      ...config.headers,
    }
    return config;
  },
  error => {
    // Promise.reject(error)
    throw error;
  });

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use((response) => {
  return response
}, async function (error) {
  // const originalRequest = error.config;

  // if (!!error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
  //   originalRequest._retry = true;
  //   return axiosApiInstance(originalRequest);
  // }
  // return Promise.reject(error);
  throw error;
});

module.exports.translate = async (input, language) => {
  const config = {
    headers: {
      language,
    },
  };
  const { data: response } = await axiosApiInstance.put(`/i18n/translate`, { input }, config);

  return response;
};

module.exports.getSetting = async key => {
  const user = accountManagement.loginAsService();

  const config = {
    headers: {
      Authorization: "Bearer " + user.data.token,
    },
  };
  const { data: response } = await axiosApiInstance.put(`/setting/${key}`, {}, config);

  return response;
};
