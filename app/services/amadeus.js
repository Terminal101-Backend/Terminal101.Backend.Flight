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
    await getAccessToken();
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error);
});

const getAccessToken = async () => {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.AMADEUS_API_KEY);
  params.append("client_secret", process.env.AMADEUS_API_SECRET);
  delete axios.defaults.headers.common['Authorization'];

  const { data: response } = await axios.post(process.env.AMADEUS_BASE_URL + "/v1/security/oauth2/token", params, {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  accessToken = response.access_token;

  return response;
};

const airlineCodeLookup = async code => {
  const { data: response } = await axiosApiInstance.get("/v1/reference-data/airlines", {
    params: {
      airlineCodes: code
    }
  });

  return response;
};

const searchAirportAndCity = async keyword => {
  const { data: response } = await axiosApiInstance.get("/v1/reference-data/locations", {
    params: {
      subType: "AIRPORT,CITY",
      keyword
    },
  });

  return response;
};

const flightOffersSingleSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, adults = 1, children, infants, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD") => {
  const { data: response } = await axiosApiInstance.get("/v2/shopping/flight-offers", {
    params: {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      // includedAirlineCodes,
      // excludedAirlineCodes,
      // nonStop,
      currencyCode,
    },
  });

  return response;
};

const flightOffersMultiSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments, adults = 1, children, infants, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD") => {
  const originDestinations = [];
  originDestinations.push({
    id: 0,
    originLocationCode,
    destinationLocationCode,
    departureDateTimeRange: {
      date: departureDate,
    },
  });

  for (let index = 0; index < segments.length; index++) {
    originDestinations.push({
      id: index + 1,
      originLocationCode: segments[index].originCode,
      destinationLocationCode: segments[index].destinationCode,
      departureDateTimeRange: {
        date: segments[index].date,
      },
    });
  }

  if (!!returnDate) {
    originDestinations.push({
      id: segments.length + 1,
      originLocationCode: segments[segments.length - 1].destinationCode,
      destinationLocationCode: originLocationCode,
      departureDateTimeRange: {
        date: returnDate,
      },
    });
  }

  const travelers = [];
  let travelersCount = 0;
  for (let i = 0; i < adults; i++) {
    travelers.push({
      id: travelersCount++,
      travelerType: "ADULT",
    })
  }
  for (let i = 0; i < children; i++) {
    travelers.push({
      id: travelersCount++,
      travelerType: "CHILD",
    })
  }
  for (let i = 0; i < infants; i++) {
    travelers.push({
      id: travelersCount++,
      travelerType: "INFANT",
    })
  }

  // console.log({ travelers, originDestinations });

  const { data: response } = await axiosApiInstance.post("/v2/shopping/flight-offers", {
    currencyCode,
    originDestinations,
    travelers,
    sources: ["GDS"],
  });

  return response;
};

const covid19AreaReport = async (countryCode, cityCode) => {
  const { data: response } = await axiosApiInstance.get("/v1/duty-of-care/diseases/covid19-area-report", {
    params: {
      countryCode,
      cityCode,
    },
  });

  return response;
};

const updateFlightPrice = async flightDetails => {
  const { data: response } = await axiosApiInstance.post("/v1//shopping/flight-offers/pricing", {
    flightDetails
  });

  return response;
};

module.exports = {
  getAccessToken,
  airlineCodeLookup,
  searchAirportAndCity,
  flightOffersSingleSearch,
  flightOffersMultiSearch,
  updateFlightPrice,
  covid19AreaReport,
};
