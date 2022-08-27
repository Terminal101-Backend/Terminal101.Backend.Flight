const axios = require("axios");
const axiosApiInstance = axios.create();
let accessToken = "";

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.AMADEUS_SERVICE_BASE_URL;
    config.headers = {
      // "Authorization": `Bearer ${accessToken}`,
      "Accept": "*/*",
      "Client-Secret": process.env.AMADEUS_SERVICE_CLIENT_SECRET,
      "Client-Key": process.env.AMADEUS_SERVICE_CLIENT_KEY,
      "Content-Type": "application/json-patch+json",
      // "Content-Type": "application/json",
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
//     axios.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
//     return axiosApiInstance(originalRequest);
//   }
//   return Promise.reject(error);
// });

// const getAccessToken = async () => {
//   const params = new URLSearchParams();
//   params.append("grant_type", "client_credentials");
//   params.append("client_id", process.env.AMADEUS_API_KEY);
//   params.append("client_secret", process.env.AMADEUS_API_SECRET);
//   delete axios.defaults.headers.common["Authorization"];

//   const {
//     data: response
//   } = await axios.post(process.env.AMADEUS_BASE_URL + "/v1/security/oauth2/token", params, {
//     headers: {
//       "content-type": "application/x-www-form-urlencoded"
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
    if (!!segments && (segments.length > 0)) {
      originDestinations.push({
        departure: {
          airportCode: segments[segments.length - 1].originCode,
          date: returnDate,
        },
        arrival: {
          airportCode: originLocationCode,
        },
      });
    } else {
      originDestinations.push({
        departure: {
          airportCode: destinationLocationCode,
          date: returnDate,
        },
        arrival: {
          airportCode: originLocationCode,
        },
      });
    }
  }

  const requestData = {
    preferences: {
      cabin: [
        "5",
      ],
      nonStop: nonStop ?? 0,
    },
    originDestinations,
    travelers: {
      adt: adults,
      chd: children ?? 0,
      inf: infants ?? 0,
    },
  };

  const { data: response } = await axiosApiInstance.post("/Flight/Search", requestData);

  return response;
};
 
const bookFlight = async (flight, passengers) => {
  console.log(JSON.stringify({ passengers, flight }));

  const { data: response } = await axiosApiInstance.post("/Flight/AirBook",
    {
      passengers,
      flight,
    }
  );

  return response;
};

const airReValidate = async flightInfo => {
  try {
    const { data: response } = await axiosApiInstance.post("/Flight/AirRevalidate",
      flightInfo
    );

    return response;
  } catch (e) { console.log('error soap => ', airReValidate) }
};

module.exports = {
  searchFlight,
  bookFlight,
  airReValidate,
};