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
axiosApiInstance.interceptors.request.use(
  async config => {
    const testMode = config?.testMode ?? false;
    const pathPostfix = testMode ? "_TEST" : "";

    if (!sessionId) {
      await createSession(testMode);
      config.data.SessionId = sessionId;
    }
    config.baseURL = process.env["PARTO_BASE_URL" + pathPostfix];
    config.headers = {
      // 'Authorization': `Bearer ${sessionId}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    return config;
  },
  error => {
    Promise.reject(error)
  });

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use(async response => {
  if (!!response.data.Success) {
    return { data: response };
  } else {
    const originalRequest = response.config;
    // const testMode = originalRequest?.testMode ?? false;

    if (!!response.data.Error && response.data.Error.Message.toLowerCase().split(" ").some(word => ["session", "sessionid"].includes(word)) && !originalRequest._retry) {
      originalRequest._retry = true;
      sessionId = false;
      // await createSession(testMode);
      // const requestData = JSON.parse(originalRequest.data);
      // requestData.SessionId = sessionId;
      // originalRequest.data = JSON.stringify(requestData);
      // originalRequest.headers["Content-Length"] = originalRequest.data.length;
      return axiosApiInstance(originalRequest);
      // return airLowFareSearch(requestData.OriginDestinationInformations[0].OriginLocationCode, requestData.OriginDestinationInformations[0].DestinationLocationCode, requestData.OriginDestinationInformations[0].DepartureDateTime);
    }
    throw response.data.Error.Message;
  }
}, async error => {
  throw error;
});

const createSession = async testMode => {
  const pathPostfix = testMode ? "_TEST" : "";

  const params = {
    OfficeId: process.env["PARTO_OFFICE_ID" + pathPostfix],
    Username: process.env["PARTO_USERNAME" + pathPostfix],
    Password: process.env["PARTO_PASSWORD" + pathPostfix],
  };

  const {
    data: response
  } = await axios.post(process.env["PARTO_BASE_URL" + pathPostfix] + "/Authenticate/CreateSession", params, {});

  sessionId = response.SessionId;

  return response;
};

const airLowFareSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments = [], adults = 1, children = 0, infants = 0, travelClass = "ECONOMY", includedAirlineCodes = [], excludedAirlineCodes = [], nonStop, currencyCode = "USD", testMode = true) => {
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

    case "FIRST":
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

  if (!!returnDate && (!segments || (segments.length === 0))) {
    airTripType = 2;
  } else if (!segments || (segments.length === 0)) {
    airTripType = 1;
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
    if (!!segments && (segments.length > 0)) {
      originDestinations.push({
        OriginLocationCode: segments[segments.length - 1].destinationCode,
        DestinationLocationCode: originLocationCode,
        OriginType: 0,
        DestinationType: 0,
        DepartureDateTime: returnDate,
      });
    } else {
      originDestinations.push({
        OriginLocationCode: destinationLocationCode,
        DestinationLocationCode: originLocationCode,
        OriginType: 0,
        DestinationType: 0,
        DepartureDateTime: returnDate,
      });
    }
  }


  const {
    data: response
  } = await axiosApiInstance.post("/Air/AirLowFareSearch", {
    PricingSourceType: 0,
    RequestOption: 2,
    // SessionId: sessionId,
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
  }, { testMode });

  return response.data.PricedItineraries;
};

/**
 *
 * @param {String} fareSourceCode
 * @param {LeaderInfo} contact
 * @param {TravelerInfo[]} travelers
 * @returns
 */
const airBook = async (fareSourceCode, contact, travelers, testMode = true) => {
  const params = {
    FareSourceCode: fareSourceCode,
    // SessionId: sessionId,
    // ClientUniqueId: clientUniqueId,
    // MarkupForAdult: 0.0,
    // MarkupForChild: 0.0,
    // MarkupForInfant: 0.0,
    TravelerInfo: {
      PhoneNumber: contact.mobileNumber,
      Email: contact.email,
      AirTravelers: travelers.map(traveler => {
        const infant = 2 * 365 * 24 * 3600 * 1000;
        const child = 12 * 365 * 24 * 3600 * 1000
        const age = new Date() - new Date(traveler.birthDate);
        if ((traveler.gender === "TRANS") || (traveler.gender === "OTHER")) {
          traveler.gender = "MALE";
        }
        const passengerType = (age < infant) ? 3 : (age < child) ? 2 : 1;
        const passengerTitle = (passengerType === 1) ? ((traveler.gender === "MALE") ? 0 : 2) : ((traveler.gender === "MALE") ? 4 : 3);


        return {
          DateOfBirth: traveler.birthDate,
          Gender: traveler.gender,
          PassengerType: passengerType,
          NationalId: traveler.nationalId,
          Nationality: traveler.document.issuedAt,
          ExtraServiceId: traveler.extraServiceIds ?? [],
          MealTypeServiceId: traveler.mealTypeServiceIds ?? [],
          Wheelchair: !!traveler.wheelchair,
          PassengerName: {
            PassengerFirstName: traveler.firstName,
            PassengerMiddleName: traveler.middleName,
            PassengerLastName: traveler.lastName,
            PassengerTitle: passengerTitle,
          },
          Passport: {
            Country: traveler.document.issuedAt,
            ExpiryDate: traveler.document.expirationDate,
            // IssueDate: traveler.document.issueDate,
            PassportNumber: traveler.document.code,
          },
        }
      }),
    },
  };

  const {
    data: response
  } = await axiosApiInstance.post("/Air/AirBook", params, { testMode });

  return response;
};

/**
 *
 * @param {String} bookId
 * @returns
 */
const airBookData = async (bookId, testMode = true) => {
  const params = {
    UniqueId: bookId,
    // SessionId: sessionId,
  };

  const {
    data: response
  } = await axiosApiInstance.post("/Air/AirBookingData", params, { testMode });

  return response;
};

/**
 *
 * @param {String} bookId
 * @returns
 */
const airBookCancel = async (bookId, testMode = true) => {
  const params = {
    UniqueId: bookId,
    // SessionId: sessionId,
  };

  const {
    data: response
  } = await axiosApiInstance.post("/Air/AirCancel", params, { testMode });

  return response;
};

/**
 *
 * @param {String} bookId
 * @returns
 */
const airBookRefund = async (bookId, testMode = true) => {
  const params = {
    UniqueId: bookId,
    // SessionId: sessionId,
    RefundType: 'Eticket'
  };

  const {
    data: response
  } = await axiosApiInstance.post("/Air/AirRefund", params, { testMode });

  return response;
};

/**
 *
 * @param {String} bookId
 * @returns
 */
const airBookIssuing = async (bookId, testMode) => {
  const params = {
    UniqueId: bookId,
    // SessionId: sessionId,
  };

  const {
    data: response
  } = await axiosApiInstance.post("/Air/AirOrderTicket", params, { testMode });

  return response;
};

/**
 *
 * @param {String} fareSourceCode
 * @returns
 */
const airRevalidate = async (fareSourceCode, testMode = true) => {
  const params = {
    FareSourceCode: fareSourceCode,
    // SessionId: sessionId,
  };

  try {
    const {
      data: response
    } = await axiosApiInstance.post("/Air/airRevalidate", params, { testMode });

    return response.data;
  } catch (e) {
    console.log('error soap => ', airRevalidate);
    return e
  }
};

module.exports = {
  createSession,
  airLowFareSearch,
  airBook,
  airBookData,
  airBookCancel,
  airBookRefund,
  airBookIssuing,
  airRevalidate
};