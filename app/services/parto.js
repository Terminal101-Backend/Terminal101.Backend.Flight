const axios = require("axios");
const axiosApiInstance = axios.create();
let sessionId = "";

// Request interceptor for API calls
// axiosApiInstance.interceptors.request.use(
//   async config => {
//     config.baseURL = process.env.PARTO_BASE_URL;
//     config.headers = {
//       'Authorization': `Bearer ${sessionId}`,
//       'Accept': 'application/json',
//       'Content-Type': 'application/json',
//     }
//     return config;
//   },
//   error => {
//     Promise.reject(error)
//   });

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use(async response => {
  if (!!response.data.Success) {
    return { data: response };
  } else {
    const originalRequest = response.config;

    if (!!response.data.Error && ["SessionID cannot be null"].includes(response.data.Error.Message) && !originalRequest._retry) {
      originalRequest._retry = true;
      await createSession();
      const requestData = JSON.parse(originalRequest.data);
      requestData.SessionId = sessionId;
      originalRequest.data = JSON.stringify(requestData);
      originalRequest.headers["Content-Length"] = originalRequest.data.length;
      return axiosApiInstance(originalRequest);
      // return airLowFareSearch(requestData.OriginDestinationInformations[0].OriginLocationCode, requestData.OriginDestinationInformations[0].DestinationLocationCode, requestData.OriginDestinationInformations[0].DepartureDateTime);
    }
    throw response.data.Error.Message;
  }
}, async error => {
  throw error;
});

const createSession = async () => {
  const params = {
    OfficeId: process.env.PARTO_OFFICE_ID,
    Username: process.env.PARTO_USERNAME,
    Password: process.env.PARTO_PASSWORD,
  };

  const {
    data: response
  } = await axios.post(process.env.PARTO_BASE_URL + "/Authenticate/CreateSession", params, {
  });

  sessionId = response.SessionId;

  return response;
};

const airLowFareSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, adults = 1, children = 0, infants = 0, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD") => {
  const {
    data: response
  } = await axiosApiInstance.post(process.env.PARTO_BASE_URL + "/Air/AirLowFareSearch", {
    PricingSourceType: 0,
    RequestOption: 2,
    SessionId: sessionId,
    AdultCount: adults,
    ChildCount: children,
    InfantCount: infants,
    TravelPreference: {
      CabinType: 1,
      MaxStopsQuantity: 0,
      AirTripType: 1,
      VendorExcludeCodes: [
      ],
      VendorPreferenceCodes: [
      ]
    },
    OriginDestinationInformations: [
      {
        DepartureDateTime: departureDate,
        DestinationLocationCode: destinationLocationCode,
        DestinationType: 0,
        OriginLocationCode: originLocationCode,
        OriginType: 0
      }
    ],
  });

  return response;
};

module.exports = {
  createSession,
  airLowFareSearch,
};