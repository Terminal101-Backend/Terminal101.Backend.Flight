const axios = require("axios");
const axiosApiInstance = axios.create();
let token = "";

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.ACCOUNT_MANAGEMENT_SERVICE_URL;
    config.headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/json',
    }
    return config;
  },
  error => {
    Promise.reject(error)
  });

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use((response) => {
  return response
}, async function (error) {
  const originalRequest = error.config;

  if (!!error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
    originalRequest._retry = true;
    await loginAsService();
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error?.response?.data ?? error?.response ?? error);
});

const loginAsService = async () => {
  const params = {
    email: process.env.SERVICE_USERNAME,
    password: process.env.SERVICE_PASSWORD,
    device: {
      name: "server",
      appVersion: 0,
      deviceVersion: 0
    }
  };
  delete axios.defaults.headers.common['Authorization'];

  const {data: response} = await axios.post(process.env.ACCOUNT_MANAGEMENT_SERVICE_URL + "/user/login/email", params, {
    headers: {
      "Service-Name": "wallet",
      "User-Type": "SERVICE",
    },
  });

  token = response.data.token;

  return response;
};

const getUserInfo = async userCode => {
  const {data: response} = await axiosApiInstance.get(`/user/${userCode}`);

  return response;
};

const getUsersInfo = async userCodes => {
  const {data: response} = await axiosApiInstance.put(`/user`, {userCodes});

  return response;
};

const checkUserAccess = async (userCode, userType, serviceName, method, path) => {
  const params = new URLSearchParams();
  params.append("userType", userType);
  params.append("method", method);
  params.append("path", path);
  params.append("serviceName", serviceName);

  const {data: response} = await axiosApiInstance.get(`/user/${userCode}/access`, {params});

  return response.data;
};

module.exports = {
  loginAsService,
  getUserInfo,
  getUsersInfo,
  checkUserAccess,
};
