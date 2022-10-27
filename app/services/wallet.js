const axios = require("axios");
const axiosApiInstance = axios.create();
const { loginAsService } = require("./accountManagement");
let token = "";

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.WALLET_SERVICE_URL;
    config.headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/json',
    };
    config.paramsSerializer = params => {
      return JSON.stringify(params, { arrayFormat: 'brackets' })
    };
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
  return Promise.reject(error?.response?.data ?? error?.response ?? error);
});

const chargeUserWallet = async (userCode, paymentMethodName, amount, currencySource, currencyTarget) => {
  try {
    const { data: response } = await axiosApiInstance.post(`/wallet/charge/${userCode}`, {
      paymentMethodName,
      currencySource,
      currencyTarget,
      amount,
      serviceName: "FLIGHT"
    });

    return response.data;
  } catch (e) {
    throw 'There was a problem with checkout, please try again.'
  }
};

// const chargeUserWalletByCryptoCurrency = async (userCode, amount) => {
//   const { data: response } = await axiosApiInstance.post(`/wallet/crypto-currency/charge/${userCode}`, {
//     amount,
//     serviceName: "FLIGHT"
//   });

//   return response.data;
// };

/**
 *
 * @param {String} userCode
 * @returns {Promise}
 */
const getPaymentMethod = async userCode => {
  const { data: response } = await axiosApiInstance.get(`/payment/method/${userCode}`);

  return response.data;
};

/**
 *
 * @param {String} userCode
 * @returns {Promise}
 */
const getUserWallet = async userCode => {
  const { data: response } = await axiosApiInstance.get(`/wallet/${userCode}`);

  return response.data;
};

/**
 *
 * @param {String} userCode
 * @param {String} externalTransactionId
 * @returns {Promise}
 */
const getUserTransaction = async (userCode, externalTransactionId) => {
  const { data: response } = await axiosApiInstance.get(`/wallet/${userCode}/transaction/${externalTransactionId}`);

  return response.data;
};

/**
 *
 * @param {String} userCode
 * @param {String} amount
 * @returns {Promise}
 */
const addAndConfirmUserTransaction = async (userCode, amount, description) => {
  const { data: response } = await axiosApiInstance.post(`/wallet/${userCode}/transaction`, {
    amount,
    description,
    serviceName: "FLIGHT",
    type: "PAY"
  });

  return response.data;
};

const cancelPayment = async transactionId => {
  const { data: response } = await axiosApiInstance.get(`/wallet/credit-card/cancel-payment/${transactionId}`);

  return response.data;
}

module.exports = {
  getUserWallet,
  chargeUserWallet,
  getUserTransaction,
  addAndConfirmUserTransaction,
  // chargeUserWalletByCryptoCurrency,
  getPaymentMethod,
  cancelPayment,
};
