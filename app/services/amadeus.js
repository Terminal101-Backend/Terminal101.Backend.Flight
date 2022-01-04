const axios = require("axios");
const axiosApiInstance = axios.create();
let accessToken = "";

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.AMADEUS_BASE_URL;
    config.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
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
    await getAccessToken();
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error);
});

getAccessToken = async () => {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.AMADEUS_API_KEY);
  params.append("client_secret", process.env.AMADEUS_API_SECRET);

  const { data: response } = await axios.post(process.env.AMADEUS_BASE_URL + "/security/oauth2/token", params, {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  accessToken = response.access_token;

  return response;
};

airlineCodeLookup = async code => {
  const { data: response } = await axiosApiInstance.get("/reference-data/airlines", {
    params: {
      airlineCodes: code
    }
  });

  return response;
};

searchAirportAndCity = async keyword => {
  const { data: response } = await axiosApiInstance.get("/reference-data/locations", {
    params: {
      subType: "AIRPORT,CITY",
      keyword
    },
  });

  return response;
};

module.exports = {
  getAccessToken,
  airlineCodeLookup,
  searchAirportAndCity,
};
