const axios = require("axios");
const axiosApiInstance = axios.create();
const { loginAsService } = require("./accountManagement");
let token = "";

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.WALLET_SERVICE;
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
    const { data: response } = await loginAsService();
    token = response.token;
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error);
});

const chargeUserWalletByCreditCard = async (userCode, amount) => {
  const { data: response } = await axiosApiInstance.post(`/wallet/charge-by-credit-card/${userCode}`, {
    amount,
    serviceName: "FLIGHT"
  });

  return response.data;
};

const getPaymentMethod = async (userCode, amount) => {
  const { data: response } = await axiosApiInstance.get(`/payment/method/${userCode}`);

  return response.data;
};

const getUserWallet = async (userCode, amount) => {
  const { data: response } = await axiosApiInstance.get(`/wallet/${userCode}`);

  return response.data;
};

module.exports = {
  getUserWallet,
  chargeUserWalletByCreditCard,
  getPaymentMethod,
};
