const axios = require("axios");
const axiosApiInstance = axios.create();
let accessToken = "";
let testMode;

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    testMode = config?.testMode ?? false;
    const pathPostFix = testMode ? "_TEST" : "";

    config.baseURL = process.env['AMADEUS_BASE_URL' + pathPostFix];
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
    const pathPostFix = testMode ? "_TEST" : "";

    await getAccessToken(pathPostFix);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error);
});

const getAccessToken = async (pathPostFix) => {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env['AMADEUS_API_KEY' + pathPostFix]);
  params.append("client_secret", process.env['AMADEUS_API_SECRET' + pathPostFix]);
  delete axios.defaults.headers.common['Authorization'];

  const {
    data: response
  } = await axios.post(process.env['AMADEUS_BASE_URL' + pathPostFix] + "/v1/security/oauth2/token", params, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
  });

  accessToken = response.access_token;

  return response;
};

const airlineCodeLookup = async (code, testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.get("/v1/reference-data/airlines", {
    params: {
      airlineCodes: code
    }
  }, {testMode});

  return response;
};

const searchAirportAndCity = async (keyword, testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.get("/v1/reference-data/locations", {
    params: {
      subType: "AIRPORT,CITY",
      keyword
    },
  }, {testMode});

  return response;
};

const flightOffersSingleSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, adults = 1, children, infants, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD", testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.get("/v2/shopping/flight-offers", {
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
  }, {testMode});

  return response;
};

const flightOffersMultiSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments, adults = 1, children, infants, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD", testMode = true) => {
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

  const {
    data: response
  } = await axiosApiInstance.post("/v2/shopping/flight-offers", {
    currencyCode,
    originDestinations,
    travelers,
    sources: ["GDS"],
  }, {testMode});

  return response;
};

const covid19AreaReport = async (countryCode, cityCode, testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.get("/v1/duty-of-care/diseases/covid19-area-report", {
    params: {
      countryCode,
      cityCode,
    },
  }, {testMode});

  return response;
};

const updateFlightPrice = async (flightOffer, testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.post("/v1/shopping/flight-offers/pricing", {
    data: {
      type: "flight-offers-pricing",
      flightOffers: [flightOffer]
    }
  }, {testMode});

  return response;
};

const flightCreateOrder = async (flightOffer, travelers, testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.post("/v1/booking/flight-orders", {
    data: {
      type: "flight-order",
      flightOffers: [flightOffer],
      travelers,
    }
  }, {testMode});

  return response;
};

const getFlightOrder = async (orderId, testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.get(`/v1/booking/flight-orders/${orderId}`, {testMode});

  return response;
};

const deleteFlightOrder = async (orderId, testMode = true) => {
  const {
    data: response
  } = await axiosApiInstance.delete(`/v1/booking/flight-orders/${orderId}`, {testMode});

  return response;
};

const searchAirportAndCityWithAccessToken = async (keyword, testMode = true) => {
  const pathPostFix = testMode ? "_TEST" : "";

  const accessToken = await getAccessToken(pathPostFix);

  axiosApiInstance.headers = { 'Authorization': 'Bearer ' + accessToken.access_token };
  const { data: response } = await axiosApiInstance.get(process.env['AMADEUS_BASE_URL' + pathPostFix] + "/v1/reference-data/locations", {
    params: {
      subType: "AIRPORT,CITY",
      keyword
    },
  });
  return response;
};

const searchAirportAndCityNearestWithAccessToken = async (latitude, longitude, testMode = true) => {
  const pathPostFix = testMode ? "_TEST" : "";
  const accessToken = await getAccessToken(pathPostFix);

  axiosApiInstance.headers = { 'Authorization': 'Bearer ' + accessToken.access_token };
  const { data: response } = await axiosApiInstance.get(process.env['AMADEUS_BASE_URL' + pathPostFix] + "/v1/reference-data/locations/airports", {
    params: {
      latitude,
      longitude,
      sort: "distance"

    },
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
  flightCreateOrder,
  getFlightOrder,
  deleteFlightOrder,
  searchAirportAndCityWithAccessToken,
  searchAirportAndCityNearestWithAccessToken
};