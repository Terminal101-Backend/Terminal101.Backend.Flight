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

const airLowFareSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments, adults = 1, children = 0, infants = 0, travelClass, includedAirlineCodes = [], excludedAirlineCodes = [], nonStop, currencyCode = "USD") => {
  let cabinType = 1;
  let airTripType = 1;

  switch (travelClass) {
    case "ECONOMY":
      cabinType = 1;
      break;

    case "PREMIUM_ECONOMY":
      cabinType = 2;
      break;

    case "BUSINESS":
      cabinType = 3;
      break;

    case "FIRST_CLASS":
      cabinType = 5;
      break;

    default:
      throw "travel_class_invalid";
  }

  const originDestinations = [];
  originDestinations.push({
    OriginLocationCode: originLocationCode,
    DestinationLocationCode: destinationLocationCode,
    OriginType: 0,
    DestinationType: 0,
    DepartureDateTime: departureDate,
  });

  if (!segments || (segments.length === 0)) {
    airTripType = 1;
  } else if (!!returnDate) {
    airTripType = 2;
  } else {
    airTripType = 4;
  }

  for (let index = 0; index < segments.length; index++) {
    originDestinations.push({
      OriginLocationCode: segments[index].originCode,
      DestinationLocationCode: segments[index].destinationCode,
      OriginType: 0,
      DestinationType: 0,
      DepartureDateTime: segments[index].date,
    });
  }

  if (!!returnDate) {
    originDestinations.push({
      OriginLocationCode: segments[segments.length - 1].destinationCode,
      DestinationLocationCode: originLocationCode,
      OriginType: 0,
      DestinationType: 0,
      DepartureDateTime: returnDate,
    });
  }


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
      CabinType: cabinType,
      MaxStopsQuantity: !!nonStop ? 2 : 0,
      AirTripType: airTripType,
      VendorExcludeCodes: excludedAirlineCodes,
      VendorPreferenceCodes: includedAirlineCodes,
    },
    OriginDestinationInformations: originDestinations,
  });

  return response.data.PricedItineraries;
};

module.exports = {
  createSession,
  airLowFareSearch,
};