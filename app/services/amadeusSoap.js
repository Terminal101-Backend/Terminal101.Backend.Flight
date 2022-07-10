const axios = require("axios");
const axiosApiInstance = axios.create();
let accessToken = "";

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.AMADEUS_SERVICE_BASE_URL;
    config.headers = {
      // 'Authorization': `Bearer ${accessToken}`,
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
// axiosApiInstance.interceptors.response.use((response) => {
//   return response
// }, async function (error) {
//   const originalRequest = error.config;

//   if (!!error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
//     originalRequest._retry = true;
//     await getAccessToken();
//     axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
//     return axiosApiInstance(originalRequest);
//   }
//   return Promise.reject(error);
// });

// const getAccessToken = async () => {
//   const params = new URLSearchParams();
//   params.append("grant_type", "client_credentials");
//   params.append("client_id", process.env.AMADEUS_API_KEY);
//   params.append("client_secret", process.env.AMADEUS_API_SECRET);
//   delete axios.defaults.headers.common['Authorization'];

//   const {
//     data: response
//   } = await axios.post(process.env.AMADEUS_BASE_URL + "/v1/security/oauth2/token", params, {
//     headers: {
//       'content-type': 'application/x-www-form-urlencoded'
//     },
//   });

//   accessToken = response.access_token;

//   return response;
// };

const searchFlight = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments, adults = 1, children, infants, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD") => {
  const originDestinations = [];
  originDestinations.push({
    departure: {
      airportCode: originLocationCode,
      date: departureDate,
    },
    arrival: {
      airportCode: destinationLocationCode,
    },
  });

  for (let index = 0; index < segments.length; index++) {
    originDestinations.push({
      departure: {
        airportCode: segments[index].originCode,
        date: segments[index].date,
      },
      arrival: {
        airportCode: segments[index].destinationCode,
      },
    });
  }

  if (!!returnDate) {
    originDestinations.push({
      departure: {
        airportCode: segments[segments.length - 1].originCode,
        date: returnDate,
      },
      arrival: {
        airportCode: originLocationCode,
      },
    });
  }

  const {
    data: response
  } = await axiosApiInstance.post("/Flight/Search", {
    prefrences: {
      cabin: [
        5,
      ],
      nonStop,
    },
    originDestinations,
    travelers: {
      adt: adults,
      chd: children,
      inf: infants,
    },
  });

  return response;
};

const bookFlight = async (flightOffer, travelers) => {
  const {
    data: response
  } = await axiosApiInstance.post("/Flight/AirBook", {
    data: {
      type: "flight-order",
      flightOffers: [flightOffer],
      travelers,
    }
  });

  return response;
};


module.exports = {
  searchFlight,
  bookFlight,
};