const axios = require("axios");
const axiosApiInstance = axios.create();
let sessionId = "";

/**
 * @typedef {Object} LeaderInfo
 * @property {String} phoneNumber
 * @property {String} email
 */
/**
 * @typedef {Object} TravelerInfo
 * @property {String} dateOfBirth
 * @property {Number} gender
 * @property {Number} passengerType
 * @property {NameInfo} passengerName
 * @property {PassportInfo} passport
 * @property {String} nationalId
 * @property {String} nationality
 * @property {String[]} extraServiceIds
 * @property {String[]} mealTypeServiceIds
 * @property {Number} seatPreference
 * @property {Number} mealPreference
 * @property {Boolean} wheelchair
 */
/**
 * @typedef {Object} NameInfo
 * @property {String} firstName
 * @property {String} middleName
 * @property {String} lastName
 * @property {Number} title
 */
/**
 * @typedef {Object} PassportInfo
 * @property {String} issuedAt
 * @property {String} expirationDate
 * @property {String} issueDate
 * @property {String} number
 */

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

    if (!!response.data.Error && response.data.Error.Message.toLowerCase().split(" ").some(word => ["session", "sessionid"].includes(word)) && !originalRequest._retry) {
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

const airLowFareSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments = [], adults = 1, children = 0, infants = 0, travelClass = "ECONOMY", includedAirlineCodes = [], excludedAirlineCodes = [], nonStop, currencyCode = "USD") => {
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

/**
 * 
 * @param {String} fareSourceCode 
 * @param {LeaderInfo} leader 
 * @param {TravelerInfo[]} travelers 
 * @returns 
 */
const airBook = async (fareSourceCode, leader, travelers) => {
  const params = {
    FareSourceCode: fareSourceCode,
    SessionId: sessionId,
    // ClientUniqueId: clientUniqueId,
    // MarkupForAdult: 0.0,
    // MarkupForChild: 0.0,
    // MarkupForInfant: 0.0,
    TravelerInfo: {
      PhoneNumber: leader.phoneNumber,
      Email: leader.email,
      AirTravelers: travelers.map(traveler => ({
        DateOfBirth: traveler.dateOfBirth,
        Gender: traveler.gender,
        passengerType: traveler.passengerType,
        NationalId: traveler.nationalId,
        Nationality: traveler.nationality,
        ExtraServiceId: traveler.extraServiceIds ?? [],
        MealTypeServiceId: traveler.mealTypeServiceIds ?? [],
        Wheelchair: traveler.wheelchair,
        PassengerName: {
          PassengerFirstName: traveler.passengerName.firstName,
          PassengerMiddleName: traveler.passengerName.middleName,
          PassengerLastName: traveler.passengerName.lastName,
          PassengerTitle: traveler.passengerName.title,
        },
        Passport: {
          Country: traveler.passport.issuedAt,
          ExpiryDate: traveler.passport.expirationDate,
          // IssueDate: traveler.passport.issueDate,
          PassportNumber: traveler.passport.number,
        },
      })),
    },
  };

  const {
    data: response
  } = await axios.post(process.env.PARTO_BASE_URL + "/Air/AirBook", params, {
  });

  return response;
};

/**
 * 
 * @param {String} bookId 
 * @returns 
 */
const airBookData = async bookId => {
  const params = {
    UniqueId: bookId,
    SessionId: sessionId,
  };

  const {
    data: response
  } = await axios.post(process.env.PARTO_BASE_URL + "/Air/AirBookingData", params, {
  });

  return response;
};

/**
 * 
 * @param {String} bookId 
 * @returns 
 */
const airBookCancel = async bookId => {
  const params = {
    UniqueId: bookId,
    SessionId: sessionId,
  };

  const {
    data: response
  } = await axios.post(process.env.PARTO_BASE_URL + "/Air/AirCancel", params, {
  });

  return response;
};

module.exports = {
  createSession,
  airLowFareSearch,
  airBook,
  airBookData,
  airBookCancel,
};